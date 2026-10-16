#include "../include/FireEmergency.h"

FireEmergency::FireEmergency(int id, int locId, int sev, double risk, const std::string& stat)
    : Emergency(id, locId, sev, stat), fireRisk(risk) {}

double FireEmergency::getFireRisk() const {
    return fireRisk;
}

void FireEmergency::setFireRisk(double risk) {
    fireRisk = risk;
}

std::string FireEmergency::getType() const {
    return "Fire Emergency";
}

void FireEmergency::display() const {
    std::cout << "[ID: " << emergencyId << "] Type: " << getType()
              << " | Location ID: " << locationId
              << " | Severity: " << severity
              << " | Fire Risk Level: " << fireRisk
              << " | Status: " << status << std::endl;
}