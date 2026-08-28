import sqlite3
import json
from datetime import datetime


DATABASE_NAME = "compliance.db"


def get_connection():
    return sqlite3.connect(DATABASE_NAME)


def initialize_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            scanned_on TEXT,
            product_data TEXT,
            compliance_data TEXT
        )
    """)

    connection.commit()
    connection.close()


def save_scan(filename, product_data, compliance_data):
    connection = get_connection()
    cursor = connection.cursor()

    scanned_on = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO scans (
            filename,
            scanned_on,
            product_data,
            compliance_data
        )
        VALUES (?, ?, ?, ?)
    """, (
        filename,
        scanned_on,
        json.dumps(product_data),
        json.dumps(compliance_data)
    ))

    connection.commit()

    scan_id = cursor.lastrowid

    connection.close()

    return scan_id


def get_scan_history():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            filename,
            scanned_on,
            product_data,
            compliance_data
        FROM scans
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    connection.close()

    history = []

    for row in rows:
        history.append({
            "id": row[0],
            "filename": row[1],
            "scanned_on": row[2],
            "product_data": json.loads(row[3]),
            "compliance": json.loads(row[4])
        })

    return history
