cd C:\Users\Atakan\Desktop\
mkdir SimulationResults
cd SimulationResults
mkdir Simulation1
cd Simulation1
energyplus -w C:\Users\Atakan\Desktop\IstanbulWeather.epw -r C:\Users\Atakan\Desktop\Datacenter.idf
cd ..

mkdir Simulation2
cd Simulation2
energyplus -w C:\Users\Atakan\Desktop\StockHolmWeather.epw -r C:\Users\Atakan\Desktop\Datacenter.idf
cd ..
