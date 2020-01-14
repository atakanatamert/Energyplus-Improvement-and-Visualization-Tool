cd C:\Users\hp\Desktop\FinalProjectTestFiles\
mkdir SimulationResults
cd SimulationResults
mkdir Simulation1
cd Simulation1
energyplus -w C:\Users\hp\Desktop\FinalProjectTestFiles\IstanbulWeather.epw -r C:\Users\hp\Desktop\FinalProjectTestFiles\Datacenter.idf
cd ..

mkdir Simulation2
cd Simulation2
energyplus -w C:\Users\hp\Desktop\FinalProjectTestFiles\StockholmWeather.epw -r C:\Users\hp\Desktop\FinalProjectTestFiles\Datacenter.idf
cd ..
