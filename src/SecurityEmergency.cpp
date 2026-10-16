#include "../include/SecurityEmergency.h"

SecurityEmergency::SecurityEmergency(int id, int locId, int sev, const std::string& threat, const std::string& stat)
    : Emergency(id, locId, sev, stat), securityThreat(threat) {}

std::string SecurityEmergency::getSecurityThreat() const {
    return securityThreat;
}

void SecurityEmergency::setSecurityThreat(const std::string& threat) {
    securityThreat = threat;
}

std::string SecurityEmergency::getType() const {
    return "Security Emergency";
}

void SecurityEmergency::display() const {
    std::cout << "[ID: " << emergencyId << "] Type: " << getType()
              << " | Location ID: " << locationId
              << " | Severity: " << severity
              << " | Threat Detail: " << securityThreat
              << " | Status: " << status << std::endl;
}