import json
from pathlib import Path

class ThumConfig(dict):
	def __init__(self, file_path):
		self.file_path = file_path
		self.cfg = {}

	def get(self, key):
		return self.cfg[key]

	def load(self):
		if not Path(self.file_path).is_file():
			exit(f'Thum configuration file {self.file_path} do not exist.')

		with open(self.file_path, 'r+') as f:
			self.cfg = json.load(f)
