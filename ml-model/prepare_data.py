import os
import shutil
import random

def prepare_dataset():
    # Source directories
    base_src = "dataset/plantvillage dataset/color"
    categories = {
        "Potato___healthy": "Healthy",
        "Potato___Early_blight": "Early_Blight",
        "Potato___Late_blight": "Late_Blight"
    }
    
    # Destination directories
    base_dst = "dataset"
    splits = ["train", "val", "test"]
    
    # Count partition configuration
    # Keep sizes small to ensure fast training on CPU
    counts = {
        "train": 50,
        "val": 15,
        "test": 15
    }
    
    # Create target directories
    for split in splits:
        for target_class in categories.values():
            os.makedirs(os.path.join(base_dst, split, target_class), exist_ok=True)
            
    # Partition images
    for src_folder, target_class in categories.items():
        src_path = os.path.join(base_src, src_folder)
        if not os.path.exists(src_path):
            print(f"Source path {src_path} not found. Skipping.")
            continue
            
        images = [f for f in os.listdir(src_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        # Shuffle to get a representative random sample
        random.seed(42)
        random.shuffle(images)
        
        total_needed = counts["train"] + counts["val"] + counts["test"]
        if len(images) < total_needed:
            print(f"Warning: only {len(images)} found in {src_folder}, needed {total_needed}.")
            
        # Segment splits
        train_imgs = images[:counts["train"]]
        val_imgs = images[counts["train"]:counts["train"] + counts["val"]]
        test_imgs = images[counts["train"] + counts["val"]:total_needed]
        
        # Copy files
        for img in train_imgs:
            shutil.copy(os.path.join(src_path, img), os.path.join(base_dst, "train", target_class, img))
        for img in val_imgs:
            shutil.copy(os.path.join(src_path, img), os.path.join(base_dst, "val", target_class, img))
        for img in test_imgs:
            shutil.copy(os.path.join(src_path, img), os.path.join(base_dst, "test", target_class, img))
            
        print(f"Segmented {target_class}: {len(train_imgs)} train, {len(val_imgs)} val, {len(test_imgs)} test.")

if __name__ == "__main__":
    prepare_dataset()
