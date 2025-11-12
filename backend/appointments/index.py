'''
Business: Manage patient appointments with automatic doctor assignment
Args: event - dict with httpMethod, body (user_id, symptoms, service_id)
      context - object with request_id attribute
Returns: HTTP response with appointment data
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            if user_id:
                cur.execute("""
                    SELECT a.id, a.symptoms, a.status, a.scheduled_date, a.created_at,
                           d.full_name as doctor_name, d.specialization,
                           s.title as service_name
                    FROM appointments a
                    LEFT JOIN doctors d ON a.doctor_id = d.id
                    LEFT JOIN services s ON a.service_id = s.id
                    WHERE a.user_id = %s
                    ORDER BY a.created_at DESC
                """, (user_id,))
            else:
                cur.execute("""
                    SELECT a.id, a.symptoms, a.status, a.scheduled_date, a.created_at,
                           u.full_name as patient_name,
                           d.full_name as doctor_name, d.specialization,
                           s.title as service_name
                    FROM appointments a
                    LEFT JOIN users u ON a.user_id = u.id
                    LEFT JOIN doctors d ON a.doctor_id = d.id
                    LEFT JOIN services s ON a.service_id = s.id
                    ORDER BY a.created_at DESC
                    LIMIT 50
                """)
            
            appointments = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps([dict(a) for a in appointments], default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            symptoms = body_data.get('symptoms')
            service_id = body_data.get('service_id')
            
            if not all([user_id, symptoms]):
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute("SELECT id FROM doctors WHERE available = true ORDER BY RANDOM() LIMIT 1")
            doctor = cur.fetchone()
            
            if not doctor:
                return {
                    'statusCode': 503,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'No available doctors'})
                }
            
            scheduled_date = datetime.now() + timedelta(days=1)
            
            cur.execute("""
                INSERT INTO appointments (user_id, doctor_id, service_id, symptoms, status, scheduled_date)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, symptoms, status, scheduled_date
            """, (user_id, doctor['id'], service_id, symptoms, 'confirmed', scheduled_date))
            
            appointment = cur.fetchone()
            conn.commit()
            
            cur.execute("SELECT full_name, specialization FROM doctors WHERE id = %s", (doctor['id'],))
            doctor_info = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'id': appointment['id'],
                    'symptoms': appointment['symptoms'],
                    'status': appointment['status'],
                    'scheduled_date': str(appointment['scheduled_date']),
                    'doctor': {
                        'name': doctor_info['full_name'],
                        'specialization': doctor_info['specialization']
                    }
                })
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        conn.close()
