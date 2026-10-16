#include "../include/Emergency.h"

Emergency::Emergency(int id, int locId, int sev, const std::string& stat)
    : emergencyId(id), locationId(locId), severity(sev), status(stat) {}

int Emergency::getEmergencyId() const {
    return emergencyId;
}

int Emergency::getLocationId() const {
    return locationId;
}

int Emergency::getSeverity() const {
    return severity;
}

std::string Emergency::getStatus() const {
    return status;
}

void Emergency::setSeverity(int sev) {
    severity = sev;
}

void Emergency::setStatus(const std::string& stat) {
    status = stat;
}

std::string Emergency::getType() const {
    return "General Emergency";
}

void Emergency::display() const {
    std::cout << "[ID: " << emergencyId << "] Type: " << getType()
              << " | Location ID: " << locationId
              << " | Severity: " << severity
              << " | Status: " << status << std::endl;
}