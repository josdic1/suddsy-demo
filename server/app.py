from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from models import db, Machine, Session
from schemas import machine_schema, machines_schema, session_schema
from pricing import BASE_PRICE, calculate_buffer_price

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///laundrospin.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)


# ===================
# ROUTES
# ===================

@app.get('/api/machines')
def get_machines():
    """Get all machines with their current status."""
    machines = Machine.query.all()
    
    # Add active session to each machine
    result = []
    for machine in machines:
        data = machine_schema.dump(machine)
        # Find active session for this machine
        active = Session.query.filter_by(machine_id=machine.id, is_active=True).first()
        data['active_session'] = session_schema.dump(active) if active else None
        result.append(data)
    
    return jsonify(result), 200


@app.get('/api/machines/<int:id>')
def get_machine(id):
    """Get a single machine."""
    machine = Machine.query.get_or_404(id)
    data = machine_schema.dump(machine)
    
    active = Session.query.filter_by(machine_id=id, is_active=True).first()
    data['active_session'] = session_schema.dump(active) if active else None
    
    return jsonify(data), 200


@app.post('/api/sessions')
def start_session():
    """Start a new wash/dry session."""
    data = request.json
    
    machine_id = data.get('machine_id')
    user_name = data.get('user_name', 'Anonymous')
    buffer_minutes = data.get('buffer_minutes', 0)
    
    # Check machine is available
    machine = Machine.query.get_or_404(machine_id)
    if machine.status != 'available':
        return jsonify({'error': 'Machine not available'}), 400
    
    # Calculate pricing
    buffer_price = calculate_buffer_price(buffer_minutes)
    
    # Create session
    session = Session(
        machine_id=machine_id,
        user_name=user_name,
        cycle_seconds=2400,  # 40 min
        buffer_seconds=buffer_minutes * 60,
        started_at=datetime.now(),
        base_paid=BASE_PRICE,
        buffer_paid=buffer_price,
        is_active=True
    )
    
    # Update machine status
    machine.status = 'in_cycle'
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify(session_schema.dump(session)), 201


@app.patch('/api/sessions/<int:id>/end')
def end_session(id):
    """End a session (user picks up clothes)."""
    session = Session.query.get_or_404(id)
    
    if not session.is_active:
        return jsonify({'error': 'Session already ended'}), 400
    
    # Mark session as done
    session.is_active = False
    
    # Free up the machine
    machine = Machine.query.get(session.machine_id)
    machine.status = 'available'
    
    db.session.commit()
    
    return jsonify(session_schema.dump(session)), 200


@app.patch('/api/machines/<int:id>/status')
def update_machine_status(id):
    """Update machine status (for simulation/timer updates)."""
    machine = Machine.query.get_or_404(id)
    data = request.json
    
    new_status = data.get('status')
    if new_status in ['available', 'in_cycle', 'in_buffer', 'overstay']:
        machine.status = new_status
        db.session.commit()
    
    return jsonify(machine_schema.dump(machine)), 200


# ===================
# SEED DATA
# ===================

def seed_machines():
    """Create the 8 machines if they don't exist."""
    if Machine.query.count() == 0:
        machines = [
            Machine(id=1, type='washer', status='available'),
            Machine(id=2, type='washer', status='available'),
            Machine(id=3, type='washer', status='available'),
            Machine(id=4, type='washer', status='available'),
            Machine(id=5, type='dryer', status='available'),
            Machine(id=6, type='dryer', status='available'),
            Machine(id=7, type='dryer', status='available'),
            Machine(id=8, type='dryer', status='available'),
        ]
        db.session.add_all(machines)
        db.session.commit()
        print("Seeded 8 machines!")


# ===================
# RUN
# ===================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_machines()
    app.run(debug=True, port=5555)