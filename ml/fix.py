import os
import fileinput

# Path to the tensorflowjs read_weights.py file
file_path = "/Users/christianbachynskyi/flamelessowo/projects/ablock/ml/venv2/lib/python3.12/site-packages/tensorflowjs/read_weights.py"

# Function to replace np.object with object
def replace_np_object(file_path):
    with fileinput.FileInput(file_path, inplace=True, backup='.bak') as file:
        for line in file:
            print(line.replace('np.object', 'object'), end='')

# Replace np.object with object
replace_np_object(file_path)

print(f"Modified {file_path} to replace np.object with object.")

