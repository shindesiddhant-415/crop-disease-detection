import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
import copy
import random
import numpy as np
import matplotlib.pyplot as plt

# Set seeds for reproducibility
torch.manual_seed(42)
np.random.seed(42)
random.seed(42)

# Define Hyperparameters
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 10  # Reduced to prevent overfitting
DATASET_PATH = 'dataset/'

def main():
    print("WARNING: Make sure dataset/ contains subfolders for each class (e.g., Healthy, Early_Blight, Late_Blight).")
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset path {DATASET_PATH} not found. Creating dummy folder structure...")
        for split in ['train', 'val', 'test']:
            for c in ['Healthy', 'Early_Blight', 'Late_Blight']:
                os.makedirs(os.path.join(DATASET_PATH, split, c), exist_ok=True)
        print("Please place your images in the respective folders and run this script again.")
        return

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # 1. Data Augmentation and Normalization
    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(30),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    # 2. Load Data Generators
    train_dir = os.path.join(DATASET_PATH, 'train')
    val_dir = os.path.join(DATASET_PATH, 'val')
    test_dir = os.path.join(DATASET_PATH, 'test')
    
    if not os.path.exists(train_dir) or not os.path.exists(val_dir) or not os.path.exists(test_dir):
        print("Error: dataset/ must contain 'train', 'val', and 'test' subfolders.")
        return

    train_dataset = datasets.ImageFolder(root=train_dir, transform=transform)
    val_dataset = datasets.ImageFolder(root=val_dir, transform=transform)
    test_dataset = datasets.ImageFolder(root=test_dir, transform=transform)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

    num_classes = len(train_dataset.classes)
    class_names = train_dataset.classes
    print(f"Found {num_classes} classes: {class_names}")
    print("Class order:", train_dataset.classes)

    if num_classes == 0:
        print("No images found! Please add images to dataset/ folders.")
        return

    # 3. Define MobileNetV2 Architecture
    model = models.mobilenet_v2(pretrained=True)

    # Freeze base layers
    for param in model.features.parameters():
        param.requires_grad = False

    # Replace classifier with Dropout to prevent overfitting
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(model.last_channel, num_classes)
    )
    model = model.to(device)

    # 4. Optimizer and Loss
    # Calculate class weights to handle dataset imbalance
    import numpy as np
    targets = train_dataset.targets
    class_counts = np.bincount(targets)
    weights = 1.0 / class_counts
    normalized_weights = weights * len(targets) / num_classes
    class_weights = torch.FloatTensor(normalized_weights).to(device)
    print("Class weights:", class_weights)
    
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.Adam(model.classifier.parameters(), lr=0.001)

    # 5. Train Model
    print("Starting Training...")
    
    patience = 3
    best_val_loss = float('inf')
    epochs_no_improve = 0
    best_model_state = None
    
    # History tracking
    history = {'train_loss': [], 'val_loss': [], 'train_acc': [], 'val_acc': []}
    
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
        train_loss = running_loss / len(train_loader)
        train_acc = correct / total
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                val_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
                
        val_loss /= len(val_loader)
        val_acc = val_correct / val_total
        
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        print(f"Epoch {epoch+1}/{EPOCHS} - "
              f"loss: {train_loss:.4f} - accuracy: {train_acc:.4f} - "
              f"val_loss: {val_loss:.4f} - val_accuracy: {val_acc:.4f}")

        # Early Stopping Logic
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            epochs_no_improve = 0
            best_model_state = copy.deepcopy(model.state_dict())
        else:
            epochs_no_improve += 1
            print(f"Early stopping counter: {epochs_no_improve} out of {patience}")
            if epochs_no_improve >= patience:
                print("Early stopping triggered! Restoring best model weights.")
                model.load_state_dict(best_model_state)
                break

    # 6. Evaluate on Independent Test Set
    print("\nEvaluating on Independent Test Set...")
    model.eval()
    test_loss = 0.0
    test_correct = 0
    test_total = 0
    
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            test_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            test_total += labels.size(0)
            test_correct += (predicted == labels).sum().item()
            
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            
    test_loss /= len(test_loader)
    test_acc = test_correct / test_total
    
    from sklearn.metrics import confusion_matrix, classification_report, ConfusionMatrixDisplay
    
    print("\n--- Final Results ---")
    print(f"Final Training Accuracy: {train_acc:.4f}")
    print(f"Final Validation Accuracy: {val_acc:.4f}")
    print(f"Final Testing Accuracy: {test_acc:.4f}")
    
    print("\n--- Confusion Matrix ---")
    cm = confusion_matrix(all_labels, all_preds)
    print(cm)
    
    print("\n--- Classification Report (Precision, Recall, F1) ---")
    cr = classification_report(all_labels, all_preds, target_names=class_names)
    print(cr)
    print("---------------------\n")
    
    # Save the classification report to a text file
    os.makedirs('results', exist_ok=True)
    with open('results/classification_report.txt', 'w') as f:
        f.write("--- Final Results ---\n")
        f.write(f"Final Training Accuracy: {train_acc:.4f}\n")
        f.write(f"Final Validation Accuracy: {val_acc:.4f}\n")
        f.write(f"Final Testing Accuracy: {test_acc:.4f}\n\n")
        f.write("--- Classification Report ---\n")
        f.write(cr)
        
    # Generate and save visual confusion matrix
    plt.figure(figsize=(8, 6))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names)
    disp.plot(cmap=plt.cm.Blues, ax=plt.gca())
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.savefig('results/confusion_matrix.png')
    plt.close()

    # 7. Save Model and Plots
    torch.save({
        'model_state_dict': model.state_dict(),
        'class_names': train_dataset.classes
    }, 'model.pth')
    print("Model saved as model.pth successfully!")
    
    # Generate and save plots
    os.makedirs('results', exist_ok=True)
    
    # Accuracy Plot
    plt.figure(figsize=(8, 6))
    plt.plot(history['train_acc'], label='Training Accuracy')
    plt.plot(history['val_acc'], label='Validation Accuracy')
    plt.title('Training and Validation Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.savefig('results/accuracy_graph.png')
    plt.close()
    
    # Loss Plot
    plt.figure(figsize=(8, 6))
    plt.plot(history['train_loss'], label='Training Loss')
    plt.plot(history['val_loss'], label='Validation Loss')
    plt.title('Training and Validation Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()
    plt.savefig('results/loss_graph.png')
    plt.close()
    
    print("Training graphs saved in results/ directory!")

if __name__ == '__main__':
    main()
