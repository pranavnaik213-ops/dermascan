import zipfile
from PIL import Image
import numpy as np

z = zipfile.ZipFile("training-data/dog_skin_dataset.zip")
lbl_text = z.read("5dbht54kw7-1/image_label.txt").decode("utf-8-sig")
labels = {}
for line in lbl_text.splitlines():
    parts = line.strip().split()
    if len(parts) >= 2:
        labels[parts[0].lower()] = parts[1].lower()

class_stats = {}

for name in z.namelist():
    if name.lower().endswith("/pic0.jpg"):
        cid = name.split("/")[-2].lower()
        if cid in labels:
            cls = labels[cid]
            img = Image.open(z.open(name)).convert("RGB")
            arr = np.array(img, dtype=np.float32)
            
            # Center region (where lesion/skin is placed under clinical aperture)
            h, w, _ = arr.shape
            center_crop = arr[int(h*0.2):int(h*0.8), int(w*0.2):int(w*0.8)]
            
            r = center_crop[:, :, 0]
            g = center_crop[:, :, 1]
            b = center_crop[:, :, 2]
            
            # Mask out black background border if any (multispectral aperture ring)
            gray = 0.299 * r + 0.587 * g + 0.114 * b
            skin_mask = (gray > 25) & (gray < 245)
            
            if np.sum(skin_mask) > 1000:
                r_skin = r[skin_mask]
                g_skin = g[skin_mask]
                b_skin = b[skin_mask]
                
                # Clinical Erythema: log(R) - log(G)
                ei = np.mean(np.log(np.maximum(r_skin, 1.0)) - np.log(np.maximum(g_skin, 1.0)))
                
                # Redness ratio: R / (G + B)
                red_ratio = np.mean(r_skin / (g_skin + b_skin + 1.0))
                
                # Texture variance (roughness/crusting)
                local_var = np.var(gray[skin_mask])
                
                # Hyperpigmentation/Melanin
                mi = np.mean(np.log(255.0 / np.maximum(r_skin, 1.0)) - np.log(255.0 / np.maximum(g_skin, 1.0)))
                
                if cls not in class_stats:
                    class_stats[cls] = []
                class_stats[cls].append({
                    "ei": float(ei),
                    "red_ratio": float(red_ratio),
                    "var": float(local_var),
                    "mi": float(mi),
                    "mean_gray": float(np.mean(gray[skin_mask]))
                })

for cls, stats in class_stats.items():
    print(f"\n--- Class: {cls} (N={len(stats)}) ---")
    print(f"  Mean Erythema Index (EI):     {np.mean([s['ei'] for s in stats]):.4f} +/- {np.std([s['ei'] for s in stats]):.4f}")
    print(f"  Mean Redness Ratio:           {np.mean([s['red_ratio'] for s in stats]):.4f} +/- {np.std([s['red_ratio'] for s in stats]):.4f}")
    print(f"  Mean Texture Variance:        {np.mean([s['var'] for s in stats]):.1f} +/- {np.std([s['var'] for s in stats]):.1f}")
    print(f"  Mean Melanin Index (MI):      {np.mean([s['mi'] for s in stats]):.4f} +/- {np.std([s['mi'] for s in stats]):.4f}")
