cd C:\Users\Atakan\Desktop\FinalProject\
mkdir SimulationResults
cd SimulationResults
mkdir Simulation1
cd Simulation1
energyplus -w C:\Users\Atakan\Desktop\FinalProject\NOR_Bergen.013110_IWEC.epw -r C:\Users\Atakan\Desktop\FinalProject\idf.idf
cd ..

mkdir Simulation2
cd Simulation2
energyplus -w C:\Users\Atakan\Desktop\FinalProject\ZWE_Harare.677750_IWEC.epw -r C:\Users\Atakan\Desktop\FinalProject\idf.idf
cd ..
