## 2006-SCSB-35 

# SETUP

Install Node and the javascript dependencies
https://nodejs.org/en/download/
```bash
npm install react-router-dom vite node npx
```
Install python and its dependencies
https://www.python.org/downloads/
```bash
pip install -r requirements.txt
```
Install mongodb Community edition
https://www.mongodb.com/try/download/community

# RUNNING
Navigate to /path/to/2006-SCSB-35/2ManyFoods/2manyfoods-frontend, and run
```bash
npm run dev
```
In a separate console start the mongodb server
```bash
cd 'C:/Program Files/MongoDB/Server/8.2/bin'
./mongod --port 27017 --dbpath "/path/to/db/2006-SCSB-35/2ManyFoods/db" (replace this with the path to the db folder)
```
In a third console, run the flask server
```bash
python -u /path/to/folder/2006-SCSB-35/2ManyFoods/main.py
```

TEAM:
-Tan Jun Jie Terence (Frontend/Backend)
-Tan Zhong Liang (Frontend)
-Yan Hanxuan (Frontend/Diagrams)
-Shahrel Chua Zong Yuan (Backend)
-Kee Jun Xi, Ansel (Backend)
-Taing Meyling (Backend/UI Design)
-Zhan Yi Yun (Backend/Technical Designer/Diagrams)