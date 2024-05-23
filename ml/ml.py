import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, SpatialDropout1D, Bidirectional
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

# Load data
with open('data_5000.json', 'r') as file:
    propaganda_data = json.load(file)

with open('not_propaganda5000.json', 'r') as file:
    not_propaganda_data = json.load(file)

propaganda_texts = propaganda_data['russianPropaganda']
not_propaganda_texts = not_propaganda_data['notPropaganda']

texts = propaganda_texts + not_propaganda_texts
labels = [1] * len(propaganda_texts) + [0] * len(not_propaganda_texts)

# Clean texts
import re
def clean_text(text):
    text = re.sub(r'http\S+', '', text)  # Remove URLs
    text = re.sub(r'[^A-Za-z0-9\s]', '', text)  # Remove special characters
    text = text.lower().strip()  # Convert to lowercase and strip whitespace
    return text

texts = [clean_text(text) for text in texts]

# Tokenize texts
max_words = 10000
max_len = 100
tokenizer = Tokenizer(num_words=max_words, oov_token='<OOV>')
tokenizer.fit_on_texts(texts)
sequences = tokenizer.texts_to_sequences(texts)
padded_sequences = pad_sequences(sequences, maxlen=max_len, padding='post')

# Convert labels to numpy array
labels = np.array(labels)

# Split data
X_train, X_test, y_train, y_test = train_test_split(padded_sequences, labels, test_size=0.2, random_state=42)

# Build model
embedding_dim = 128
model = Sequential([
    Embedding(max_words, embedding_dim, input_length=max_len),
    SpatialDropout1D(0.2),
    Bidirectional(LSTM(128, dropout=0.2, recurrent_dropout=0.2)),
    Dense(1, activation='sigmoid')
])

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

# Train model
history = model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test), verbose=2)

# Evaluate model
y_pred = (model.predict(X_test) > 0.5).astype("int32")
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))

# Save the model
model.save('text_classification_model5000.h5')

# Save the tokenizer's word index
with open('vocabulary5000.json', 'w') as f:
    json.dump(tokenizer.word_index, f)

