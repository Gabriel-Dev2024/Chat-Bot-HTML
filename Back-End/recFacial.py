from time import sleep
import cv2
import tkinter as tk
from tkinter import Button, Label, Frame
from PIL import Image, ImageTk
import webbrowser
import os

# Configuração do classificador e reconhecedor
classific = cv2.CascadeClassifier("./Back-End/haarcascade_frontalface_default.xml")  # Classificador de faces
reconhecedor = cv2.face.EigenFaceRecognizer_create()
reconhecedor.read("./Back-End/classificadorEigen.yml")  # Modelo treinado para identificar faces
largura, altura = 220, 220

# Variáveis globais
camera = None
janela = None
video_label = None
font = cv2.FONT_HERSHEY_COMPLEX_SMALL
rodando = False

def my_open():
    caminho_html = os.path.abspath("./Front-End/index.html")
    webbrowser.open_new(f"file://{caminho_html}")

def liberar_botao():
    """Libera o botão b1"""
    open_chat.config(state="normal")

def iniciar_camera():
    """Inicia a câmera e processa os frames"""
    global camera, rodando

    if not rodando:
        rodando = True
        camera = cv2.VideoCapture(0)
        atualizar_frame()

def parar_camera():
    """Para a câmera e libera os recursos"""
    global camera, rodando
    rodando = False
    if camera:
        camera.release()
        camera = None
    video_label.config(image="")  # Limpa o rótulo do vídeo

def atualizar_frame():
    """Captura frames da câmera e exibe na interface"""
    global camera, video_label, rodando

    if rodando and camera:
        conectado, imagem = camera.read()
        if conectado:
            imagemCinza = cv2.cvtColor(imagem, cv2.COLOR_BGR2GRAY)
            facesdetec = classific.detectMultiScale(imagemCinza, scaleFactor=1.5, minSize=(150, 150))
            for (x, y, l, a) in facesdetec:
                imagemFace = cv2.resize(imagemCinza[y:y + a, x:x + l], (largura, altura))
                cv2.rectangle(imagem, (x, y), (x + l, y + a), (0, 0, 255), 2)
                id, confianca = reconhecedor.predict(imagemFace)
                if id == 1:
                    nome = "Gabriel"
                    cv2.putText(imagem, str(nome), (x, y + (a + 30)), font, 2, (0, 0, 255))
                    liberar_botao()
                if id == 2:
                    nome = "Leandro"
                    cv2.putText(imagem, str(nome), (x, y + (a + 30)), font, 2, (0, 0, 255))
                    liberar_botao()
                if id == 3:
                    nome = "Sara"
                    cv2.putText(imagem, str(nome), (x, y + (a + 30)), font, 2, (0, 0, 255))
                    liberar_botao()
                if id == 4:
                    nome = "Ana Maria"
                    cv2.putText(imagem, str(nome), (x, y + (a + 30)), font, 2, (0, 0, 255))
                    liberar_botao()
                if id == 5:
                    nome = "Samira"
                    cv2.putText(imagem, str(nome), (x, y + (a + 30)), font, 2, (0, 0, 255))
                    liberar_botao()
                

            # Converte a imagem para exibição no Tkinter
            imagemRGB = cv2.cvtColor(imagem, cv2.COLOR_BGR2RGB)
            imagemPIL = Image.fromarray(imagemRGB)
            imagemTk = ImageTk.PhotoImage(image=imagemPIL)
            video_label.config(image=imagemTk)
            video_label.image = imagemTk

        # Chama novamente para atualizar
        video_label.after(10, atualizar_frame)

# Configuração da interface com Tkinter
janela = tk.Tk()
janela.title("Reconhecimento Facial com Chatbot")
janela.geometry("1000x600")

# Frame principal para o layout
frame_principal = Frame(janela)
frame_principal.pack(fill=tk.BOTH, expand=True)

# Frame para o vídeo
frame_video = Frame(frame_principal)
frame_video.pack(side=tk.LEFT, padx=10, pady=10)

video_label = Label(frame_video)
video_label.pack()

# Frame para os botões
frame_botoes = Frame(frame_principal)
frame_botoes.pack(side=tk.LEFT, padx=10, pady=10, fill=tk.Y)

# Botões
botao_iniciar = Button(frame_botoes, text="Face ID", command=iniciar_camera, width=15)
botao_iniciar.pack(pady=5)

botao_parar = Button(frame_botoes, text="Parar Câmera", command=parar_camera, width=15)
botao_parar.pack(pady=5)

botao_fechar = Button(frame_botoes, text="Fechar", command=janela.destroy, width=15)
botao_fechar.pack(pady=5)

open_chat = tk.Button(frame_botoes, text="Abrir ChatBot", fg="blue", cursor="hand2", font=18, command=my_open, state="disabled")
open_chat.pack(pady=5)

janela.mainloop()