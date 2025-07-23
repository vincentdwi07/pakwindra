import json
import matplotlib.pyplot as plt

with open("result.json") as f:
    data = json.load(f)

durasi = data["metrics"]["iteration_duration"]

# Convert ms to seconds
x = ["min", "max", "avg", "med"]
y = [
    durasi["min"] / 1000,
    durasi["max"] / 1000,
    durasi["avg"] / 1000,
    durasi["med"] / 1000
]

plt.bar(x, y, color='skyblue')
plt.title("Grafik Iteration Duration")
plt.ylabel("Durasi (detik)")
plt.xlabel("Statistik")
plt.grid(True, axis='y')
plt.show()
