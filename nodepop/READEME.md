Hola, para usar el API puedes empezar probando <http://www.zampateste.com>

Para resetear la BBDD puedes usar `npm run installDB`

@kas... los pasos que seguí para hacer la práctica fueron los siguientes:

1. Crear una instancia EC2...
	* Download de credenciales
	* Cambio de permisos al .pem
2. Crear usuario "node"
3. Modificar /etc/ssh/sshd_config para poder conectarme con password
4. Bloquear al usuario "node" el acceso con password (`sudo passwd -l node`)
5. Actualizar los repositorios de software (`sudo apt-get update`)
6. Actualizar el software (`sudo apt-get upgrade`)
7. Instalar NodeJS...
	* `curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -`
	* `sudo apt-get install -y nodejs`
8. Instalar Git (`sudo apt-get install git`)
9. Desde una consola con el usuario ubuntu, logearme con el usuario node (`sudo -u node -i`)
10. Clonar el repo de mi practica de node (`git clone https://github.com/amar1n/PracticaJS-Node.js-MongoDB-AlbertoMarin.git`)
11. Instalar las dependencias de nodepop (`npm install`)
12. Con el usuario ubuntu, instalar pm2 (`sudo npm install -g pm2`)
13. Con el usuario ubuntu, instalar nodemon (`sudo npm install -g nodemon`)
14. Con el usuario ubuntu, activar el logrotate (`sudo pm2 logrotate -u node`)
15. Modificar la configuración del logrotate para que rote los logs del usuario node
16. Con el usuario ubuntu, instalar fail2ban (`sudo apt-get install fail2ban`)
17. Con el usuario ubuntu, instalar nginx (`sudo apt-get install nginx`)
18. Modificar la configuración de nginx (`sudo nano /etc/nginx/nginx.conf`)...
	* worker_processes;
	* server_tokens off;
19. Modificar la configuración por defecto de nginx para que sirva la documentación de nodepop al usar la IP pública del servidor AWS (`sudo nano /etc/nginx/sites-available/default`)

	`server {
		...
		root /home/node/PracticaJS-Node.js-MongoDB-AlbertoMarin/nodepop/public/apidoc;
		...}`
20. Modificar la configuración de nginx para que sirva nodepop al usar el DNS...
	* Con el usuario ubuntu en el path /etc/nginx/sites-available, creo un nuevo sitio de nginx (`sudo cp default nodepop`)
	* Crear el softlink en /etc/nginx/sites-enables del file recién creado
21. Modificar la configuración del sitio nodepop para que sea nginx quien sirva el contenido estático (`sudo nano /etc/nginx/sites-available/nodepop`)...

	`server {
		...
		location ~ ^/(images) {
			root /home/node/PracticaJS-Node.js-MongoDB-AlbertoMarin/nodepop/public;
			access_log off;
			expires max;
			add_header X-Author @amarin;
		}
		...
		}`
22. Con el usuario ubuntu, instalar mongoDB...
	* `sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927`
	* `echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list`
	* `sudo apt-get update`
	* `sudo apt-get install -y mongodb-org`
23. Con el usuario ubuntu, poblar la BBDD...
	* `cd /usr/bin`
	* `./mongo /home/node/PracticaJS-Node.js-MongoDB-AlbertoMarin/nodepop/tasks/install_db.js`
24. Con el usuario node, arrancar nodepop con pm2 (`pm2 start ./bin/www --name="nodepop"`)
25. Con el usuario node, salvar la configuración de pm2 (`pm2 save`)
26. Desde la consola de AWS, crear y asociar una IP elástica (52.201.85.254) a la instancia EC2
27. Desde la consola de AWS, crear los RecorSets tipo A necesarios y asociarlos a la IP elástica recién creada...
	* El básico
	* El www.
	* El nodepop.
28. Volver a modificar la configuración de nginx para que sirva nodepop pero usando el dominio nodepop.zampateste.com en lugar de la DNS

Saludos