-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы врачей
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    experience_years INTEGER,
    photo_url TEXT,
    description TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы услуг
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы обращений
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    doctor_id INTEGER,
    service_id INTEGER,
    symptoms TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы отзывов
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    doctor_id INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы FAQ
CREATE TABLE IF NOT EXISTS faq (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых врачей
INSERT INTO doctors (full_name, specialization, experience_years, description, available) VALUES
('Иванов Алексей Петрович', 'Терапевт', 15, 'Врач высшей категории, специализируется на диагностике и лечении общих заболеваний', true),
('Смирнова Елена Викторовна', 'Кардиолог', 12, 'Кандидат медицинских наук, эксперт по заболеваниям сердечно-сосудистой системы', true),
('Петров Дмитрий Сергеевич', 'Невролог', 10, 'Специалист по лечению заболеваний нервной системы', true),
('Козлова Мария Александровна', 'Педиатр', 8, 'Врач-педиатр с опытом работы в детской клинике', true);

-- Вставка тестовых услуг
INSERT INTO services (title, description, price, duration_minutes) VALUES
('Первичная консультация терапевта', 'Осмотр, сбор анамнеза, постановка предварительного диагноза', 2000.00, 30),
('Консультация кардиолога', 'Диагностика заболеваний сердечно-сосудистой системы', 3000.00, 45),
('ЭКГ', 'Электрокардиография с расшифровкой', 1500.00, 20),
('УЗИ внутренних органов', 'Ультразвуковое исследование органов брюшной полости', 2500.00, 30),
('Анализ крови общий', 'Общий клинический анализ крови', 800.00, 15);

-- Вставка тестовых FAQ
INSERT INTO faq (question, answer, category) VALUES
('Как записаться на прием?', 'Вы можете записаться через форму на сайте, по телефону или лично в регистратуре клиники', 'Запись'),
('Какие документы нужны для первого визита?', 'Паспорт, полис ОМС (при наличии), результаты предыдущих обследований', 'Документы'),
('Можно ли отменить запись?', 'Да, отменить запись можно за 24 часа до приема через личный кабинет или по телефону', 'Запись'),
('Какие способы оплаты принимаются?', 'Наличные, банковские карты, безналичный расчет для юридических лиц', 'Оплата');