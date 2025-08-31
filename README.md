<a name="top"></a>

<h1 align="center" font-style="bold">
  $\Huge\textbf{\color{#4CAF50}GreenCart}$
</h1>

$${\color{#76C893}Bridging \space \color{#4DB6AC}Nature \space \color{#81C784}and \space \color{#AED581}Technology \space \color{#4DB6AC}for \space \color{#76C893}a \space Greener \space Tomorrow}$$

> A smart digital assistant for nurseries, garden shops, and plant lovers — helping manage stock, process orders, track deliveries, and improve customer experiences with ease.

<br>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Oracle](https://img.shields.io/badge/Database-Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Tailwind](https://img.shields.io/badge/Style-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-8E44AD?style=for-the-badge)
![Analytics](https://img.shields.io/badge/Analytics-Reports-green?style=for-the-badge)
![Hosting](https://img.shields.io/badge/Hosting-Vercel%20|%20Render%20|%20Oracle%20Cloud-blue?style=for-the-badge)

---

<h1>$\large\textbf{\color{#4CAF50}{User Roles}}$</h1><br>

<div align="center">

| $\large\text{\color{#76C893}{Role}}$ | $\large\text{\color{#F48FB1}{Description}}$ |
| ------------- | --------------------------------------------------------------------------- |
| **Admin**      | Manage plant list, stock, staff, reports, and user accounts |
| **Sales Staff** | Process orders, update sales records, check stock availability |
| **Delivery Man**     | Update delivery statuses, confirm deliveries, optimize routes |
| **Customer**     | Browse plants, place orders, track deliveries, leave reviews |

</div>

---

<h1>$\large\textbf{\color{#4CAF50}{Features}}$</h1>

<h3>$\large\textbf{\color{#d1ffbd}{1. User Management \& Authentication}}$</h3>
<ul>
  <li>Easy sign-up for customers</li>
  <li>Password recovery options</li>
  <li>Different dashboards for different staff roles</li>
  <li>Admin controls for security</li>
</ul>

<h3>$\large\textbf{\color{#C5E1A5}{2. Shopping \& Cart System}}$</h3>
<ul>
  <li>Easy-to-navigate plant catalog</li>
  <li>Save items in cart for 30 days (persistent across devices)</li>
  <li>Instant order confirmation after checkout</li>
</ul>

<h3>$\large\textbf{\color{#DCEDC8}{3. Plant Catalog}}$</h3>
<ul>
  <li>Detailed plant care guides (temperature, pruning, toxicity, seasonality)</li>
  <li>Smart filtering by plant type and needs</li>
</ul>

<h3>$\large\textbf{\color{#E6EE9C}{4. Ratings \& Reviews System}}$</h3>
<ul>
  <li>Customers can rate and review plants</li>
  <li>Share suggestions with other users</li>
  <li>Real-time comments for interactive discussions</li>
</ul>

<h3>$\large\textbf{\color{#FFF59D}{5. Discount \& Offer System}}$</h3>
<ul>
  <li>Personalized discounts for customers with abandoned carts</li>
  <li>Automatic reminders and loyalty rewards (e.g., 1+ year shoppers)</li>
  <li>Seasonal deals & promotional offers</li>
</ul>

<h3>$\large\textbf{\color{#FFE082}{6. Order \& Delivery Management}}$</h3>
<ul>
  <li>Customers place orders digitally</li>
  <li>Delivery agent assigned automatically</li>
  <li>Agents contact customers via chat or call</li>
  <li>Real-time delivery status updates</li>
  <li>Payment status updated after successful delivery</li>
</ul>

<h3>$\large\textbf{\color{#FFCC80}{7. Admin Dashboard \& Analytics}}$</h3>
<ul>
  <li>Manage orders, assign delivery staff, and handle salaries</li>
  <li>Track inventory levels with automated low-stock alerts</li>
  <li>Generate sales reports (daily, weekly, monthly)</li>
  <li>Monitor staff performance and revenue trends</li>
</ul>

---

<h1>$\large\textbf{\color{#4CAF50}{Target Users}}$</h1><br>

| Plant Nurseries | Garden Shops | Plant Lovers | 
|:--:|:--:|:--:|

---

<details>
  <summary>
    <h1>$\large\textbf{\color{#4CAF50}{Tech Stack}}$</h1><br>
  </summary>
  
  <div align="center">
  
  | $\large\text{\color{#76DCF1}{Layer}}$ | $\large\text{\color{#F48FB1}{Technology}}$ | $\large\text{\color{#52CCF6}{Version}}$ |
  |----------------------|--------------------|----------|
  | **Frontend**         | React.js + Tailwind CSS | Latest |
  | **Backend**          | Django + Python   | Latest |
  | **Database**         | Oracle DB         | Enterprise |
  | **Authentication**   | JWT               | - |
  | **Hosting**          | Vercel (Frontend), Render (Backend), Oracle Cloud (DB) | - |
  
  </div>
</details>

---

<details>
  <summary>
    <h1>$\large\textbf{\color{green}{File Structure}}$</h1><br>
  </summary>
  
  ```console
greencart/
├── backend/
│   ├── manage.py
│   └── ...
|   └── greencart.sql
├── frontend/
│   ├── index.html
│   └── ...
├── .gitignore
├── README.md
└── requirements.txt
```
</details>


---

<h1>$\large\textnormal{\color{#4CAF50}{Installation}}$</h1><br>
Clone the repository

```console
https://github.com/AfrinJahanEra/GreenCart.git
```
Or download the `zip` file, then extract it in a folder.

<h1>$\large\textnormal{\color{green}{How To Run}}$</h1>

<h2>$\large\textnormal{\color{green}{Prerequisites}}$</h2>

- Install `Python` and `React.js` and `Oracle`(optional).
- Open account in [`Cloudinary`](https://cloudinary.com/) and collect credentials from there.

<h2>$\large\textnormal{\color{green}{Server Directory}}$</h2>

Then go to the directory path(where the code is)
```console
cd "path\to\directory"
```
Then open right-click and click `open in Terminal`. Then in terminal run
```console
code .
```
This will directly take you to the VS Code interface. In `Server` directory, Open terminal and run

For `Linux/MacOS`
```console
python -m venv env
source env/bin/activate
```
For `Windows`
```console
python -m venv env
.\\env\\Scripts\\activate
```

Which will create the environment. Inside this, install the dependencies.

```console
pip install -r requirements.txt
```
This will install all the `pip` dependencies required to run this code. If it doesn't work, run this in `Command Prompt` or in  `VS Code Terminal`

```console
pip install Django python-dotenv djangorestframework django-cors-headers channels pytz oracledb dnspython certify daphne cloudinary requests
```

Then run in `Server` directory
```console
python manage.py runserver
```

If it's missing the `static directory` it will give this error
```python
django.core.exceptions.ImproperlyConfigured: 
You're using the staticfiles app without having set the required STATIC_URL setting.
```

This happens when:
- `django.contrib.staticfiles` is in INSTALLED_APPS
- But forgot to define `STATIC_URL` (and optionally STATICFILES_DIRS)

Add this to `settings.py`:
```python
import os

# Required
STATIC_URL = '/static/'

# Optional (for development)
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Optional (for production use)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

Create the static directory (if needed):
```console
mkdir static
```

<h2>$\large\textnormal{\color{green}{Client Directory}}$</h2>

In `Client` directory, Open terminal and run
 ```console
npm install
npm run dev
```

Make sure `Vite` is installed as a dev dependency in your project. Check `package.json` inside `Client/`. If something like this is present:
```json
"devDependencies": {
  "vite": "^5.0.0",  // or another version
  ...
}
```
It means `Vite` is present. If it's missing, install it:
```console
npm install vite --save-dev
```
> [!TIP]
> To fix vulnerabilities, run this :
> ```console
> npm audit fix
> ```

Or to fix all issues automatically (including breaking changes):
```console
npm audit fix --force
```

> [!CAUTION] 
> Be cautious with `--force`. It may upgrade packages that break project.

and serve it with Django or a production web server. Don’t deploy with `npm run build`.

> [!NOTE]  
> The app runs on `http://localhost:8000` by default. If port is taken, use other ports.

$${\color{#2196F3}You \space can \space change \space the \space port \space (-p) \space or \space host \space (-b) \space as \space needed.}$$

<h1>$\large\textnormal{\color{#EE4B2B}{‼ Things To Consider}}$</h1>

List this in `.env.example` file do not commit this `.env` in github

```console
SECRET_KEY=your-django-secret
DEBUG=True
MONGO_URL=mongodb://localhost:27017/techsage
REDIS_URL=redis://localhost:6379
ALLOWED_HOSTS=127.0.0.1,localhost
```

> Commit a `.env.example` file instead, which shows others what keys they need to set (but with no real values)

Check port conflicts

<img src="https://github.com/user-attachments/assets/3a3e6527-24d8-4f28-958f-9f17563a9dcb" width=100px align="right">

<div align="center">

| $\large\text{\color{#76DCF1}{Service}}$ | $\large\text{\color{#76DCF1}{Default Port}}$ |
|-----------------------------------------|----------------------------------------------|
| Daphne / Django    | `8000`       |
| React dev server   | `5173`       |

</div>

Make sure none of these ports are already in use.

> [!WARNING]  
> Browsers block WebSocket connections on `HTTP` if the main site is `HTTPS`.


<h1>$\large\textnormal{\color{#2196F3}{Team Members}}$</h1>

<div align="center">
  
| $\large\text{\color{#DAA5A4}{Name}}$ | $\large\text{\color{#D6C8FF}{Github Profile}}$ | $\large\text{\color{#C8A2C8}{Contribution}}$ |
|--------------------------------------|------------------------------------------------|----------------------------------------------|
| Afrin Jahan Era | [github](https://github.com/AfrinJahanEra) | Full Stack |
| Ramisa Anan Rahman | [github](https://github.com/Ramisa105) | Frontend |
| Ridika Naznin | [github](https://github.com/ridika-2004) | Backend |

</div>

<h1>$\large\textnormal{\color{#2196F3}{License}}$</h1>


> $${\color{lightblue}This \space \color{#5EEAD4}project \space \color{#FBF3D4}is \space \color{#D4D4FF}under}$$ [MIT License](https://github.com/AfrinJahanEra/TechSage?tab=MIT-1-ov-file)

<a href="#top">Back to top</a>

