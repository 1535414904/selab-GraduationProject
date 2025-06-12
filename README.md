### 實作成果
[查看實作成果](docs/0527專題簡報.pdf)



### frontend
1. push 之後先執行 npm install
2. 之後就跟之前一樣執行 npm run dev

### backend
1. mvn clean install
2. mvn spring-boot:run


## 使用手冊
1. git init 初始化暫存庫
2. git remote add origin https://github.com/1535414904/selab-GraduationProject.git 連上遠端
3. git log (過往的commit紀錄) /git log --oneline (顯示commit訊息以及commit id，以一行的方式精簡地顯示出commit歷史。)
4. git diff (專案檔案之間的差異就能用這個指令)
5. git pull (把本地端的東西更新到與remote repository相同的狀態)
6. git add (如果新增/刪除/更新了檔案後，可以用git add這個指令來將更動存到暫存區staging area之中。不知道有沒有對檔案進行更動可以先用"git status"來確認看看目前的檔案狀況。)
    ```
    git add 用法:
    $ git add [檔案名稱]
    $ git add .
    $ git add *
    ```
7. git commit (把在暫存區staging area內的更動存入local repository)
    ```
    git commit 用法:
    $ git commit 
    $ git commit -m "commit訊息打在引號裡面~"
    ```
8. git push (把本地端的東西推上remote repository)
