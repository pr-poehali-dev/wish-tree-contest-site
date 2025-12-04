CREATE TABLE IF NOT EXISTS wishes (
    id SERIAL PRIMARY KEY,
    child_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    wish TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    position_x DECIMAL(5,2) NOT NULL,
    position_y DECIMAL(5,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    fulfilled_by VARCHAR(255),
    fulfilled_contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wishes_status ON wishes(status);
CREATE INDEX idx_wishes_category ON wishes(category);