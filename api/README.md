### Toronto Bike Counters API
I've built analytical tables in the `../data/db.sqlite3` database using ETL pipelines that retrieve data from the City of Toronto's Open Data API. This flask API exposes these tables through endpoints to support application development, such as my next.js dashboard visualizing Toronto bike traffic data.


- Created using Flask
- Hosted on https://www.pythonanywhere.com/ (user: TorontoBikeCountersApi)

## Deployment to PythonAnywhere
1. login to the TorontoBikeCountersApi user
2. create root dir in files: `/home/TorontoBikeCountersApi/toronto-bike-counters-api`
3. upload files/use git clone
4. `Web` -> `Add a new web app` -> `Flask` -> `Python 3.13` -> `/home/TorontoBikeCountersApi/toronto-bike-counters-api/api/flask_app_pythonanywhere.py`
5. since PythonAnywhere creates/overwrites `flask_app_pythonanywhere.py` in (4.), edit/reupload the file.
6. setup venv in bash console: `pip install -r ~/toronto-bike-counters-api/requirements.txt`
7. update any env paths to have root `/home/TorontoBikeCountersApi/toronto-bike-counters-api/...`
8. Reload web app