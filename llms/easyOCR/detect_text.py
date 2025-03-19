import sys
import easyocr
reader = easyocr.Reader(['en'])

image_path = sys.argv[1]
text = reader.readtext(image_path, detail=0)
print("\n".join(text))