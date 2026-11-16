
#include "../include/Emergency.h"
using namespace std;

Emergency::Emergency(int id, int locId, int sev, string stat) {
    emergencyId = id;
    locationId = locId;
    severity = sev;
    status = stat;
}

int Emergency::getEmergencyId() const {
    return emergencyId;
}

int Emergency::getLocationId() const {
    return locationId;
}

int Emergency::getSeverity() const {
    return severity;
}

string Emergency::getStatus() const {
    return status;
}

void Emergency::setSeverity(int sev) {
    severity = sev;
}

void Emergency::setStatus(string stat) {
    status = stat;
}

string Emergency::getType() const {
    return "General Emergency";
}

void Emergency::display() const {
    cout << "ID: " << emergencyId << endl;
    cout << "Type: " << getType() << endl;
    cout << "Location: " << locationId << endl;
    cout << "Severity: " << severity << endl;
    cout << "Status: " << status << endl;
}
