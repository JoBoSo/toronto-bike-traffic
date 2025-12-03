from . import create_app

# start dev server: python -m api.flask_app_local
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)