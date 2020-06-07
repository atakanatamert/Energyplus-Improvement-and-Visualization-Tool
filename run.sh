cd C:\Users\Atakan\Desktop\FinalProject\
mkdir SimulationResults
cd SimulationResults
mkdir Simulation1
cd Simulation1
energyplus -w C:\Users\Atakan\Desktop\FinalProject\StockholmWeather.epw -r C:\Users\Atakan\Desktop\FinalProject\AdultEducationCenter.idf
cd ..

mkdir Simulation2
cd Simulation2
energyplus -w C:\Users\Atakan\Desktop\FinalProject\StockholmWeather.epw -r C:\Users\Atakan\Desktop\FinalProject\HospitalBaseline.idf
cd ..
