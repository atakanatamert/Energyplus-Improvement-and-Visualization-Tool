from pyidf import ValidationLevel
import pyidf
import logging
from pyidf.idf import IDF
import sys 

pyidf.validation_level = ValidationLevel.no

logging.info("start")
#idf = IDF(r"HospitalBaseline.idf")

idfFiles = []

for arg in sys.argv:
	if(".idf" in arg):
		idfFiles.append(arg)
	
print(idfFiles)

counter = 0

for idfFile in idfFiles:
	idf = IDF(r"" + idfFile)

	f = open("coordinates" + str(counter) + ".txt", "w+")
	
	for obj in idf.zones:
	    print(obj)
	
	print("----------------------------------------------------")
	for obj in idf.buildingsurfacedetaileds:
	    print(obj.extensibles)
	    f.write(str(obj.extensibles) + "\n")
	
	print("----------------------------------------------------")
	
	f.close()
	
	for obj in idf.fenestrationsurfacedetaileds:
	    print(obj)

	counter += 1
