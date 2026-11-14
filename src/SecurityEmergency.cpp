
#include "../include/SecurityEmergency.h"
using namespace std;

SecurityEmergency::SecurityEmergency(int id, int locId, int sev,
                                     string threat, string stat)
    : Emergency(id, locId, sev, stat) {
    securityThreat = threat;
}

string SecurityEmergency::getSecurityThreat() const {
    return securityThreat;
}

void SecurityEmergency::setSecurityThreat(string threat) {
    securityThreat = threat;
}

string SecurityEmergency::getType() const {
    return "Security Emergency";
}

void SecurityEmergency::display() const {
    cout << "ID: " << emergencyId << endl;
    cout << "Type: " << getType() << endl;
    cout << "Location: " << locationId << endl;
    cout << "Severity: " << severity << endl;
    cout << "Threat: " << securityThreat << endl;
    cout << "Status: " << status << endl;
}
