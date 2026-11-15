CXX ?= g++
CXXFLAGS ?= -std=c++17 -O2 -Wall -Wextra
INCLUDES = -Iinclude
SOURCES = src/BFSRoute.cpp src/CampusGraph.cpp src/DijkstraRoute.cpp src/Emergency.cpp src/EmergencyManager.cpp src/FireEmergency.cpp src/MedicalEmergency.cpp src/Planner.cpp src/Route.cpp src/RouteCost.cpp src/SecurityEmergency.cpp

.PHONY: all api cli clean
all: api
api: build/campus-resq-api
build/campus-resq-api: api_server.cpp $(SOURCES) | build
	$(CXX) $(CXXFLAGS) $(INCLUDES) api_server.cpp $(SOURCES) -o $@
cli: build/campus-resq-cli
build/campus-resq-cli: main.cpp $(SOURCES) | build
	$(CXX) $(CXXFLAGS) $(INCLUDES) main.cpp $(SOURCES) -o $@
build:
	mkdir -p build
clean:
	rm -rf build
