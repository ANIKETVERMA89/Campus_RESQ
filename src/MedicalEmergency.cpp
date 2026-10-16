#include "../include/MedicalEmergency.h"

MedicalEmergency::MedicalEmergency(int id, int locId, int sev, bool ambReq, const std::string& stat)
    : Emergency(id, locId, sev, stat), ambulanceRequired(ambReq) {}

bool MedicalEmergency::isAmbulanceRequired() const {
    return ambulanceRequired;
}

void MedicalEmergency::setAmbulanceRequired(bool ambReq) {
    ambulanceRequired = ambReq;
}

std::string MedicalEmergency::getType() const {
    return "Medical Emergency";
}

void MedicalEmergency::display() const {
    std::cout << "[ID: " << emergencyId << "] Type: " << getType()
              << " | Location ID: " << locationId
              << " | Severity: " << severity
              << " | Ambulance Required: " << (ambulanceRequired ? "YES" : "NO")
              << " | Status: " << status << std::endl;
}