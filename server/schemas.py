from marshmallow import Schema, fields

class SessionSchema(Schema):
    id = fields.Int(dump_only=True)
    machine_id = fields.Int()
    user_name = fields.Str()
    cycle_seconds = fields.Int()
    buffer_seconds = fields.Int()
    started_at = fields.DateTime()
    base_paid = fields.Float()
    buffer_paid = fields.Float()
    penalty_amount = fields.Float()
    is_active = fields.Bool()


class MachineSchema(Schema):
    id = fields.Int(dump_only=True)
    type = fields.Str()
    status = fields.Str()
    
    # Include the active session if there is one
    active_session = fields.Nested(SessionSchema, dump_only=True)


session_schema = SessionSchema()
machine_schema = MachineSchema()
machines_schema = MachineSchema(many=True)