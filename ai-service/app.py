from flask import Flask, request, jsonify
from flask_cors import CORS
from model import get_recommendations

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        city = data.get('city')
        state = data.get('state')
        area = data.get('area')
        
        if not city or not state:
            return jsonify({"error": "City and State are required"}), 400
            
        from model import predict_pgs_from_map
        results = predict_pgs_from_map(city, state, area)
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/locations', methods=['POST'])
def locations():
    try:
        data = request.get_json()
        state = data.get('state')
        
        if not state:
            return jsonify({"error": "State is required"}), 400
            
        from model import discover_locations
        results = discover_locations(state)
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() in ['true', '1']
    app.run(host='0.0.0.0', port=port, debug=debug_mode)

