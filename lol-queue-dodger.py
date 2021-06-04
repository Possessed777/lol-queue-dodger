import subprocess
import re
try:
    import requests
    import urllib3
except ModuleNotFoundError:
    print('[!] You are missing the "requests" module.\nYou may install it via either of the following commands: "pip install requests" or "python -m pip install requests".\n\nPress any key to exit.')
    input()
    exit()

if __name__ == '__main__':
    try:        
        print('$ lol-queue-dodger | based on x00bence aram boost Python script\n')

        # Batch command to get the client process
        command = "WMIC PROCESS WHERE name='LeagueClientUx.exe' GET commandline"

        # Execute the command
        output = subprocess.Popen(command, stdout=subprocess.PIPE,
        shell=True).stdout.read().decode('utf-8')

        # Extract needed args
        port = re.findall(r'"--app-port=(.*?)"', output)[0]
        password = re.findall(r'"--remoting-auth-token=(.*?)"', output)[0]

        # Disable the annoying certificate error
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

        # Set up session
        session = requests.session()
        session.verify = False

        print('[*] Connected to League; Press Enter in champion select to boost lobby, Control + C to exit.')

        # Running in an infinite loop, so the user doesn't have to restart the script all the time
        while True:
            input()
            headers = {'Content-type': 'application/json', 'Accept': 'application/json'}
            
            session.delete('https://127.0.0.1:%s/lol-lobby/v2/lobby' %
                    port, data={}, headers=headers, auth=requests.auth.HTTPBasicAuth('riot', password))
        
            session.post('https://127.0.0.1:%s/lol-lobby/v2/matchmaking/quick-search' %
                    port, json={'queueId': '1110'}, headers=headers, auth=requests.auth.HTTPBasicAuth('riot', password))
                    
            print('[+] Dodged the Queue!')
    except KeyboardInterrupt:
        exit()

