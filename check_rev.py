import requests

url = 'https://kjrjrjnsiynrcelzepju.supabase.co/rest/v1/study_reviews?select=*'
headers = {
    'apikey': 'sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj',
    'Authorization': 'Bearer sb_publishable_pwzXQ_2LgDo-mhjBIKcXmw_KS8es5Cj'
}
r = requests.get(url, headers=headers)
print(r.status_code)
print(r.text)
