import cv2

classific =  cv2.CascadeClassifier("./Back-End/haarcascade_frontalface_default.xml")

camera = cv2.VideoCapture(0)
amostra = 1
numAmostra = 25
id = input("Digite seu identificador: ")
largura, altura = 220, 220
print("Capturando a face..")

while True:
    conectado, imagem = camera.read()
    imagemCinza = cv2.cvtColor(imagem, cv2.COLOR_BGR2GRAY)
    facesdetec = classific.detectMultiScale(imagemCinza, scaleFactor=1.5,minSize=(150,150))

    for (x, y, l, a) in facesdetec:
        cv2.rectangle(imagem, (x,y), (x + l, y + a), (0,0,255))
        if cv2.waitKey(1) & 0xFF == ord('q'):
            imagemface = cv2.resize(imagemCinza[y:y + a, x:x + l], (largura, altura))
            cv2.imwrite("fotos/pessoas." + str(id) + "." + str(amostra) + ".jpg", imagemface)
            print("[foto " + str(amostra) + "capturada com sucesso")
            amostra += 1

    cv2.imshow("Face", imagem)
    cv2.waitKey(1)
    if amostra >= numAmostra + 1:
        break

print("Faces capturadas com sucesso!")
camera.release()
cv2.destroyAllWindows()