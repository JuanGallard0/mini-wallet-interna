DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    currency CHAR(3) NOT NULL,
    balance NUMERIC(18,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- One wallet per user per currency
    CONSTRAINT uq_wallet_user_currency UNIQUE (user_id, currency),

    -- Prevent negative balances
    CONSTRAINT chk_wallet_balance_non_negative CHECK (balance >= 0),

    -- Enforce ISO currency format (basic validation)
    CONSTRAINT chk_currency_format CHECK (currency ~ '^[A-Z]{3}$'),

    CONSTRAINT fk_wallet_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_wallet_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_currency ON wallets(currency);

CREATE TABLE transfers (
    id BIGSERIAL PRIMARY KEY,
    from_wallet_id BIGINT NOT NULL,
    to_wallet_id BIGINT NOT NULL,
    currency CHAR(3) NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    reference_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,

    -- Valid statuses
    CONSTRAINT chk_transfer_status
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),

    -- Positive amounts only
    CONSTRAINT chk_transfer_amount_positive CHECK (amount > 0),

    -- Prevent self-transfer
    CONSTRAINT chk_no_self_transfer CHECK (from_wallet_id <> to_wallet_id),

    -- Idempotency
    CONSTRAINT uq_transfer_reference UNIQUE (reference_id),

    -- Currency format
    CONSTRAINT chk_transfer_currency CHECK (currency ~ '^[A-Z]{3}$'),

    -- Foreign keys
    CONSTRAINT fk_transfer_from_wallet
        FOREIGN KEY (from_wallet_id)
        REFERENCES wallets(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_transfer_to_wallet
        FOREIGN KEY (to_wallet_id)
        REFERENCES wallets(id)
        ON DELETE RESTRICT
);

-- Indexes for main queries
CREATE INDEX idx_transfers_from_wallet ON transfers(from_wallet_id);
CREATE INDEX idx_transfers_to_wallet ON transfers(to_wallet_id);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_transfers_created_at ON transfers(created_at DESC);
CREATE INDEX idx_transfers_wallet_history
    ON transfers(from_wallet_id, created_at DESC);

CREATE OR REPLACE FUNCTION transfer_funds(
    p_from_wallet BIGINT,
    p_to_wallet BIGINT,
    p_amount NUMERIC,
    p_reference_id VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    sender_balance NUMERIC;
    sender_currency CHAR(3);
    receiver_currency CHAR(3);
    wallet_low BIGINT;
    wallet_high BIGINT;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    IF p_from_wallet = p_to_wallet THEN
        RAISE EXCEPTION 'Cannot transfer to same wallet';
    END IF;

    -- Idempotency
    IF p_reference_id IS NOT NULL THEN
        PERFORM 1 FROM transfers WHERE reference_id = p_reference_id;
        IF FOUND THEN
            RETURN;
        END IF;
    END IF;

    -- Lock in deterministic order
    wallet_low := LEAST(p_from_wallet, p_to_wallet);
    wallet_high := GREATEST(p_from_wallet, p_to_wallet);

    PERFORM 1 FROM wallets WHERE id = wallet_low FOR UPDATE;
    PERFORM 1 FROM wallets WHERE id = wallet_high FOR UPDATE;

    -- Fetch wallet data
    SELECT balance, currency
    INTO sender_balance, sender_currency
    FROM wallets
    WHERE id = p_from_wallet;

    SELECT currency
    INTO receiver_currency
    FROM wallets
    WHERE id = p_to_wallet;

    IF sender_currency IS NULL OR receiver_currency IS NULL THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    IF sender_currency <> receiver_currency THEN
        RAISE EXCEPTION 'Currency mismatch';
    END IF;

    IF sender_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- Update balances
    UPDATE wallets
    SET balance = balance - p_amount
    WHERE id = p_from_wallet;

    UPDATE wallets
    SET balance = balance + p_amount
    WHERE id = p_to_wallet;

    -- Insert transfer
    INSERT INTO transfers (
        from_wallet_id,
        to_wallet_id,
        currency,
        amount,
        status,
        reference_id,
        processed_at
    )
    VALUES (
        p_from_wallet,
        p_to_wallet,
        sender_currency,
        p_amount,
        'COMPLETED',
        p_reference_id,
        NOW()
    );

END;
$$ LANGUAGE plpgsql;

INSERT INTO users (email, full_name)
VALUES
('alice@test.com', 'Alice Doe'),
('bob@test.com', 'Bob Smith'),
('charlie@test.com', 'Charlie Brown');

-- Alice
INSERT INTO wallets (user_id, currency, balance)
VALUES
(1, 'USD', 1000.00),
(1, 'EUR', 500.00);

-- Bob
INSERT INTO wallets (user_id, currency, balance)
VALUES
(2, 'USD', 300.00);

-- Charlie
INSERT INTO wallets (user_id, currency, balance)
VALUES
(3, 'USD', 0.00);