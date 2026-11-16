
#include "../include/FireEmergency.h"
using namespace std;

FireEmergency::FireEmergency(int id, int locId, int sev, double risk, string stat)
    : Emergency(id, locId, sev, stat) {
    fireRisk = risk;
}

double FireEmergency::getFireRisk() const {
    return fireRisk;
}

void FireEmergency::setFireRisk(double risk) {
    fireRisk = risk;
}

string FireEmergency::getType() const {
    return "Fire Emergency";
}

void FireEmergency::display() const {
    cout << "ID: " << emergencyId << endl;
    cout << "Type: " << getType() << endl;
    cout << "Location: " << locationId << endl;
    cout << "Severity: " << severity << endl;
    cout << "Fire Risk: " << fireRisk << endl;
    cout << "Status: " << status << endl;
}
