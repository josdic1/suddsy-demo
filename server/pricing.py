# Pricing constants
BASE_PRICE = 3.00
PENALTY_PER_MINUTE = 0.10

def calculate_buffer_price(minutes):
    """
    Tiered buffer pricing - costs stack as you add more time.
    
    15 min  = $0.75
    30 min  = $0.75 + $1.50 = $2.25
    60 min  = $0.75 + $1.50 + $3.00 = $5.25
    120 min = $0.75 + $1.50 + $3.00 + $8.00 = $13.25
    """
    total = 0.0
    
    if minutes >= 15:
        total += 0.75
    if minutes >= 30:
        total += 1.50
    if minutes >= 60:
        total += 3.00
    if minutes >= 120:
        total += 8.00
    
    return total


def calculate_penalty(overstay_minutes):
    """
    Simple: $0.10 per minute overstaying.
    """
    return overstay_minutes * PENALTY_PER_MINUTE