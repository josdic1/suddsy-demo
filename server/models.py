from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Machine(db.Model):
    __tablename__ = 'machines'
    
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10))  # 'washer' or 'dryer'
    status = db.Column(db.String(20), default='available')  # available, in_cycle, in_buffer, overstay
    
    # Relationship
    sessions = db.relationship('Session', back_populates='machine')


class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    machine_id = db.Column(db.Integer, db.ForeignKey('machines.id'))
    user_name = db.Column(db.String(50))  # just a name for now, no auth
    
    # Time tracking (all in seconds)
    cycle_seconds = db.Column(db.Integer, default=2400)  # 40 min
    buffer_seconds = db.Column(db.Integer, default=0)
    started_at = db.Column(db.DateTime)
    
    # Money
    base_paid = db.Column(db.Float, default=3.00)
    buffer_paid = db.Column(db.Float, default=0.00)
    penalty_amount = db.Column(db.Float, default=0.00)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship
    machine = db.relationship('Machine', back_populates='sessions')