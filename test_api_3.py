import urllib.request
import json

url = "https://apis.data.go.kr/1613000/BldRgstHubService/getBrBasisOulnInfo?serviceKey=0c70894217e28613a63cea5f413098c837a45e1d3fdba3fa94b9dc273cf12e7d&sigunguCd=11680&bjdongCd=10800&platGbCd=0&bun=0123&ji=0045&numOfRows=10&pageNo=1&_type=json"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print("Exception:", e)
