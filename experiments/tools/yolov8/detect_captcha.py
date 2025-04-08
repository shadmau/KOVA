from ultralytics import YOLO
import sys
import json

if len(sys.argv) < 2:
    print("Usage: python detect_captcha.py <image_path>")
    sys.exit(1)

image_path = sys.argv[1]

model = YOLO("yolov8x.pt")

results = model.predict(image_path, device="mps", conf=0.1)

results[0].show()

detections = []

for result in results:
    for box in result.boxes:
        class_id = int(box.cls)
        class_name = model.names[class_id]
        confidence = float(box.conf)
        x1, y1, x2, y2 = map(float, box.xyxy[0]) 

        detections.append({
            "object": class_name,
            "confidence": confidence,
            "boundingBox": {
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2
            }
        })

print(json.dumps(detections)) 
sys.stdout.flush()