
#include <iostream>
#include "include/ground.h"
#include "include/BFSRoute.h"
#include "include/DijkstraRoute.h"
#include "include/FireEmergency.h"
#include "include/SecurityEmergency.h"
#include "include/MedicalEmergency.h"
#include "include/EmergencyManager.h"
#include "include/Planner.h"

using namespace std;

int main()
{
    CampusGraph campus;

    buildGroundFloor(campus);

    int source, destination;

    int fireLocation, fireSeverity;
    int securityLocation, securitySeverity;
    int medicalLocation, medicalSeverity;
    int ambulance;

    cout << "\n===== CAMPUS RESQ =====\n";

    campus.displayGraph();

    cout << "\nEnter Starting Location ID: ";
    cin >> source;

    cout << "Enter Destination ID: ";
    cin >> destination;

    cout << "\n===== ENTER EMERGENCIES =====\n";

    cout << "\nFire Location (0 = No Emergency): ";
    cin >> fireLocation;

    if (fireLocation != 0) {
        cout << "Fire Severity (1-10): ";
        cin >> fireSeverity;
    }
    else {
        fireSeverity = 0;
    }

    cout << "\nSecurity Location (0 = No Emergency): ";
    cin >> securityLocation;

    if (securityLocation != 0) {
        cout << "Security Severity (1-10): ";
        cin >> securitySeverity;
    }
    else {
        securitySeverity = 0;
    }

    cout << "\nMedical Location (0 = No Emergency): ";
    cin >> medicalLocation;

    if (medicalLocation != 0) {
        cout << "Medical Severity (1-10): ";
        cin >> medicalSeverity;

        cout << "Ambulance Required? (1-Yes, 0-No): ";
        cin >> ambulance;
    }
    else {
        medicalSeverity = 0;
        ambulance = 0;
    }

    FireEmergency fire(1, fireLocation, fireSeverity, fireSeverity);

    SecurityEmergency security(2, securityLocation, securitySeverity,
                               "Unauthorized Access");

    MedicalEmergency medical(3, medicalLocation, medicalSeverity,
                             ambulance == 1);

    EmergencyManager manager;

    if (fireLocation != 0) {
        manager.addEmergency(&fire);
    }

    if (securityLocation != 0) {
        manager.addEmergency(&security);
    }

    if (medicalLocation != 0) {
        manager.addEmergency(&medical);
    }

    cout << "\n===== PENDING EMERGENCIES =====\n";

    manager.displayAllPending();

    cout << "\n===== PROCESSING EMERGENCIES =====\n";

    if (!manager.hasEmergencies()) {
        cout << "No emergency reported.\n";
    }

    while (manager.hasEmergencies()) {

        Emergency* current = manager.popHighestPriorityEmergency();

        if (current != NULL) {

            current->setStatus("PROCESSING");

            cout << "\nProcessing Emergency:\n";

            current->display();

            applyEmergencyHazard(campus, *current);

            current->setStatus("RESOLVED");
        }
    }

    cout << "\n===== ALL EMERGENCIES PROCESSED =====\n";

    cout << "Remaining Emergencies: "
         << manager.getTotalEmergencies() << endl;

    cout << "\n===== FINAL EMERGENCY STATUS =====\n";

    if (fireLocation != 0) {
        fire.display();
    }

    if (securityLocation != 0) {
        security.display();
    }

    if (medicalLocation != 0) {
        medical.display();
    }

    cout << "\n===== UPDATED CAMPUS GRAPH =====\n";

    campus.displayGraph();

    cout << "\n===== BFS ROUTE =====\n";

    BFSRoute bfs(true);

    Route bfsRoute = bfs.findRoute(campus, source, destination);

    bfsRoute.displayRoute();

    cout << "\n===== DIJKSTRA ROUTE =====\n";

    DijkstraRoute dijkstra;

    Route dijkstraRoute = dijkstra.findRoute(campus, source, destination);

    dijkstraRoute.displayRoute();

    cout << "\n===== END =====\n";

    return 0;
}
    