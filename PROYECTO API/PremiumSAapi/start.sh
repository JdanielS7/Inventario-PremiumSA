#!/bin/bash
# Build and run .NET app for Railway

cd PremiumSAapi

dotnet restore
dotnet build -c Release

# Ejecuta el proyecto en el puerto asignado por Railway
dotnet run --urls=http://0.0.0.0:${PORT:-8080}
