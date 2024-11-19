from flask import Flask, render_template, request, jsonify, redirect, url_for
import subprocess

app = Flask(__name__)

# Rota da página inicial
@app.route('/')
def index():
    return render_template('index.html')  # Carrega o HTML da página inicial

# Rota para o reconhecimento facial
@app.route('/reconhecimento', methods=['GET'])
def reconhecimento():
    try:
        # Executa o script de reconhecimento facial
        result = subprocess.run(['python', 'recognition/face_recognition.py'], capture_output=True, text=True)
        
        # Verifica se o script retornou sucesso
        if "success" in result.stdout:
            return redirect(url_for('chatbot'))  # Redireciona para o chatbot
        else:
            return "Reconhecimento facial falhou. Tente novamente."
    except Exception as e:
        return f"Erro ao executar o reconhecimento facial: {e}"

# Rota para o chatbot
@app.route('/chatbot', methods=['GET'])
def chatbot():
    return render_template('chatbot.html')  # Carrega o HTML do chatbot

# Rota da API para processar mensagens do chatbot
@app.route('/api/chat', methods=['POST'])
def process_message():
    data = request.json
    user_message = data.get('message', '')

    # Processa a mensagem e gera uma resposta
    if "olá" in user_message.lower():
        response = "Olá! Como posso te ajudar hoje?"
    else:
        response = "Desculpe, não entendi sua pergunta."

    return jsonify({'response': response})  # Retorna a resposta em formato JSON

if __name__ == '__main__':
    app.run(debug=True)
