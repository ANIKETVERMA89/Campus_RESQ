
#include "../include/MedicalEmergency.h"
using namespace std;

MedicalEmergency::MedicalEmergency(int id, int locId, int sev,
                                   bool ambReq, string stat)
    : Emergency(id, locId, sev, stat) {
    ambulanceRequired = ambReq;
}

bool MedicalEmergency::isAmbulanceRequired() const {
    return ambulanceRequired;
}

void MedicalEmergency::setAmbulanceRequired(bool ambReq) {
    ambulanceRequired = ambReq;
}

string MedicalEmergency::getType() const {
    return "Medical Emergency";
}

void MedicalEmergency::display() const {
    cout << "ID: " << emergencyId << endl;
    cout << "Type: " << getType() << endl;
    cout << "Location: " << locationId << endl;
    cout << "Severity: " << severity << endl;

    if (ambulanceRequired) {
        cout << "Ambulance Required: YES" << endl;
    } else {
        cout << "Ambulance Required: NO" << endl;
    }

    cout << "Status: " << status << endl;
}
