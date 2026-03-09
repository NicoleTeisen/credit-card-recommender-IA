#!/usr/bin/env python3
"""
ChromaDB Bridge - REST API intermediária para navegador
Expõe endpoints simples que usam o cliente Python do ChromaDB
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
import sys

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas as rotas

# Cliente ChromaDB
client = chromadb.HttpClient(host='localhost', port=8000)
COLLECTION_NAME = 'credit_card_embeddings'

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({"status": "ok"})

@app.route('/init', methods=['POST'])
def init_collection():
    """Criar ou obter collection"""
    try:
        collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "Credit card and user embeddings"}
        )
        return jsonify({"status": "ok", "collection": COLLECTION_NAME})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add', methods=['POST'])
def add_embeddings():
    """Adicionar embeddings"""
    try:
        data = request.json
        collection = client.get_collection(COLLECTION_NAME)
        
        collection.add(
            ids=data['ids'],
            embeddings=data['embeddings'],
            metadatas=data['metadatas']
        )
        
        return jsonify({"status": "ok", "count": len(data['ids'])})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/query', methods=['POST'])
def query_embeddings():
    """Buscar embeddings similares"""
    try:
        data = request.json
        collection = client.get_collection(COLLECTION_NAME)
        
        results = collection.query(
            query_embeddings=[data['queryVector']],
            n_results=data.get('topK', 10) * 2,
            where=data.get('where')
        )
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get', methods=['POST'])
def get_embedding():
    """Obter embedding por ID"""
    try:
        data = request.json
        collection = client.get_collection(COLLECTION_NAME)
        
        results = collection.get(
            ids=data['ids'],
            include=['embeddings', 'metadatas']
        )
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/count', methods=['GET'])
def count_embeddings():
    """Contar embeddings"""
    try:
        collection = client.get_collection(COLLECTION_NAME)
        count = collection.count()
        return jsonify(count)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/list', methods=['POST'])
def list_embeddings():
    """Listar todos os embeddings (opcional: filtrar por tipo)"""
    try:
        data = request.json or {}
        collection = client.get_collection(COLLECTION_NAME)
        
        # ChromaDB get() precisa de parâmetros específicos
        if 'type' in data:
            results = collection.get(
                where={"type": data['type']},
                include=['embeddings', 'metadatas']
            )
        else:
            results = collection.get(
                include=['embeddings', 'metadatas']
            )
        
        # Converter arrays NumPy para listas Python
        if 'embeddings' in results and results['embeddings'] is not None:
            results['embeddings'] = [emb.tolist() if hasattr(emb, 'tolist') else emb for emb in results['embeddings']]
        
        return jsonify(results)
    except Exception as e:
        print(f"Error in /list: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🌉 ChromaDB Bridge Server")
    print("   ChromaDB: http://localhost:8000")
    print("   Bridge API: http://localhost:8002")
    print()
    app.run(host='0.0.0.0', port=8002, debug=False)
