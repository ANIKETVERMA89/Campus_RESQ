#include "include/ground.h"
#include "include/BFSRoute.h"
#include "include/DijkstraRoute.h"
#include "include/FireEmergency.h"
#include "include/SecurityEmergency.h"
#include "include/MedicalEmergency.h"
#include "include/Planner.h"
#include <algorithm>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <vector>
#include <iomanip>
#ifdef _WIN32
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "Ws2_32.lib")
using socket_length_t = int;
#else
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>
using socket_length_t = socklen_t;
#endif

using namespace std;

static string decode(const string& s) {
    string out;
    for (size_t i=0;i<s.size();++i) {
        if (s[i]=='+') out+=' ';
        else if (s[i]=='%' && i+2<s.size()) {
            char h[3]={s[i+1],s[i+2],0}; out += (char)strtol(h,nullptr,16); i+=2;
        } else out+=s[i];
    }
    return out;
}
static map<string,string> parseQuery(const string& q) {
    map<string,string> m; stringstream ss(q); string item;
    while(getline(ss,item,'&')) { auto p=item.find('='); if(p!=string::npos) m[decode(item.substr(0,p))]=decode(item.substr(p+1)); }
    return m;
}
static string num(double x) { ostringstream s; s<<setprecision(10)<<x; return s.str(); }
static string routeJson(const Route& r, double metresPerUnit) {
    if(!r.isValid()) return "null";
    ostringstream s; s<<"{\"source\":"<<r.getSource()<<",\"destination\":"<<r.getDestination()<<",\"path\":[";
    const auto& p=r.getPath(); for(size_t i=0;i<p.size();++i){if(i)s<<",";s<<p[i];}
    s<<"],\"units\":"<<num(r.getTotalDistance())<<",\"distance\":"<<num(r.getTotalDistance()*metresPerUnit)
     <<",\"risk\":"<<num(r.getTotalRisk())<<",\"congestion\":"<<num(r.getTotalCongestion())
     <<",\"cost\":"<<num(r.getTotalCost())<<",\"hops\":"<<(p.size()-1)<<"}"; return s.str();
}
static string handle(const string& target) {
    auto qm=target.find('?'); string path=target.substr(0,qm); auto q=parseQuery(qm==string::npos?"":target.substr(qm+1));
    if(path=="/api/health") return "{\"ok\":true,\"service\":\"Campus RESQ C++ API\",\"version\":\"1.0\"}";
    CampusGraph graph; buildGroundFloor(graph);
    const double metresPerUnit=10.0;
    if(path=="/api/graph") { ostringstream out; graph.exportJson(out,metresPerUnit); return out.str(); }
    if(path=="/api/plan") {
        string type=q.count("type")?q["type"]:"fire";
        int loc=q.count("loc")?atoi(q["loc"].c_str()):0;
        int severity=q.count("severity")?atoi(q["severity"].c_str()):5;
        if(!graph.getNode(loc) || severity<1 || severity>10) return "{\"error\":\"Invalid emergency location or severity\"}";
        Emergency* emergency=nullptr;
        if(type=="fire") emergency=new FireEmergency(1,loc,severity,severity);
        else if(type=="security") emergency=new SecurityEmergency(1,loc,severity,"Security threat");
        else if(type=="medical") emergency=new MedicalEmergency(1,loc,severity,false);
        else return "{\"error\":\"Unknown emergency type\"}";
        applyEmergencyHazard(graph,*emergency);
        ResponsePlan plan=planResponse(graph,*emergency);
        string result=string("{\"scene\":")+to_string(plan.scene)+",\"staging\":"+to_string(plan.staging)+",\"entry\":"+(plan.entry<0?"null":to_string(plan.entry))+
            ",\"staged\":"+(plan.staged?"true":"false")+",\"evac\":"+routeJson(plan.evac,metresPerUnit)+",\"responder\":"+routeJson(plan.responder,metresPerUnit)+"}";
        delete emergency;
        return result;
    }
    if(path!="/api/route") return "{\"error\":\"Not found\"}";
    int from=q.count("from")?atoi(q["from"].c_str()):1;
    int to=q.count("to")?atoi(q["to"].c_str()):0;
    string algorithm=q.count("algorithm")?q["algorithm"]:"dijkstra";
    bool evac=q.count("evac") && q["evac"]=="1";
    double a=1.0,b=evac?5.0:2.0,g=1.5;
    if(q.count("a")) a=atof(q["a"].c_str()); if(q.count("b")) b=atof(q["b"].c_str()); if(q.count("g")) g=atof(q["g"].c_str());
    // Each request gets a clean graph; active frontend alerts are replayed before route calculation.
    if(q.count("hazards")) {
        stringstream hs(q["hazards"]); string h; int eid=1;
        while(getline(hs,h,',')) {
            stringstream parts(h); string type,locS,sevS;
            if(!getline(parts,type,':')||!getline(parts,locS,':')||!getline(parts,sevS,':')) continue;
            int loc=atoi(locS.c_str()), sev=atoi(sevS.c_str());
            if(type=="fire") { FireEmergency e(eid++,loc,sev,sev); applyEmergencyHazard(graph,e); }
            else if(type=="security") { SecurityEmergency e(eid++,loc,sev,"Security threat"); applyEmergencyHazard(graph,e); }
            // Medical incidents do not block or spread hazards in the original backend.
        }
    }
    if(!graph.getNode(from) || (to!=0 && !graph.getNode(to))) return "{\"error\":\"Unknown source or destination node\"}";
    Route r;
    if(algorithm=="bfs") {
        BFSRoute bfs(evac);
        r = to==0 ? findBestExit(bfs,graph,from) : bfs.findRoute(graph,from,to);
    } else {
        DijkstraRoute dijkstra(a,b,g);
        r = to==0 ? findBestExit(dijkstra,graph,from) : dijkstra.findRoute(graph,from,to);
    }
    return string("{\"algorithm\":\"")+algorithm+"\",\"from\":"+to_string(from)+",\"requestedTo\":"+to_string(to)+",\"route\":"+routeJson(r,metresPerUnit)+"}";
}

int main(int argc,char**argv) {
    int port=argc>1?atoi(argv[1]):8080;
#ifdef _WIN32
    WSADATA wsaData{};
    const int wsaResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (wsaResult != 0) { cerr << "WSAStartup failed: " << wsaResult << endl; return 1; }
#endif
#ifdef _WIN32
    SOCKET server = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (server == INVALID_SOCKET) { cerr << "socket failed: " << WSAGetLastError() << endl; WSACleanup(); return 1; }
    BOOL yes = TRUE;
#else
    int server = socket(AF_INET, SOCK_STREAM, 0);
    if (server < 0) { perror("socket"); return 1; }
    int yes = 1;
#endif
    setsockopt(server, SOL_SOCKET, SO_REUSEADDR, reinterpret_cast<const char*>(&yes), sizeof(yes));
    sockaddr_in addr{}; addr.sin_family = AF_INET; addr.sin_addr.s_addr = htonl(INADDR_ANY); addr.sin_port = htons(static_cast<u_short>(port));
    if (bind(server, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) < 0) {
#ifdef _WIN32
        cerr << "bind failed: " << WSAGetLastError() << endl; closesocket(server); WSACleanup();
#else
        perror("bind"); close(server);
#endif
        return 1;
    }
    if (listen(server, 32) < 0) {
#ifdef _WIN32
        cerr << "listen failed: " << WSAGetLastError() << endl; closesocket(server); WSACleanup();
#else
        perror("listen"); close(server);
#endif
        return 1;
    }
    cout << "Campus RESQ API listening on http://localhost:" << port << "\n";
    while (true) {
#ifdef _WIN32
        SOCKET client = accept(server, nullptr, nullptr);
        if (client == INVALID_SOCKET) continue;
#else
        int client = accept(server, nullptr, nullptr);
        if (client < 0) continue;
#endif
        string request; char buf[4096]; int received = 0;
        while ((received = recv(client, buf, static_cast<int>(sizeof(buf)), 0)) > 0) {
            request.append(buf, static_cast<size_t>(received));
            if (request.find("\r\n\r\n") != string::npos) break;
        }
        string target = "/"; auto first = request.find(" ");
        if (first != string::npos) { auto second = request.find(" ", first + 1); if (second != string::npos) target = request.substr(first + 1, second - first - 1); }
        string body = handle(target);
        string response = "HTTP/1.1 200 OK\r\nContent-Type: application/json; charset=utf-8\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nConnection: close\r\nContent-Length: " + to_string(body.size()) + "\r\n\r\n" + body;
        size_t sent = 0;
        while (sent < response.size()) {
            int n = send(client, response.data() + sent, static_cast<int>(response.size() - sent), 0);
            if (n <= 0) break;
            sent += static_cast<size_t>(n);
        }
#ifdef _WIN32
        closesocket(client);
#else
        close(client);
#endif
    }
#ifdef _WIN32
    closesocket(server); WSACleanup();
#else
    close(server);
#endif
    return 0;
}
