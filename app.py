from flask import Flask, render_template, request
from flask_caching import Cache
import redis
import datetime

import os
from pyexcel_ods3 import get_data

app = Flask(__name__)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})
path_root = os.path.dirname(os.path.realpath(__file__))

table = 'Лист1'
file_name = 'file.ods'

# //////////////////////////////////// Цвета текста, столбец G ///////////////////////////////////////////////
colors = {'red': '#ff4646',
          'green': '#019d63',
          'blue': '#0380d3'
          }

# /////////////////////////////////// Шрифты текста, столбец H ///////////////////////////////////////////////
fonts = {'bold': 'Roboto bold',
         'italic': 'Roboto italic',
         'italic bold': 'Roboto italic bold'}

# /////////////////////////////////// Подразделение, столбец I//////////////////////////////////////////////

unit = 'unit'


class Grid:
    """
    Класс сбора информации из файла и формирования сетки с данными.
    """

    def __init__(self, table, path_root, file_name, colors, fonts, unit):
        self.table = table
        self.path_root = path_root
        self.file_name = file_name
        self.colors = colors
        self.fonts = fonts
        self.unit = unit
        self.rows = self.get_rows_in_file
        q = 1

    @property
    def get_rows_in_file(self):
        """
        Получение списка из файла.
        @return: list
        """
        data = get_data(self.path_root + "/files/" + self.file_name)
        result = data.get(self.table)
        if result is None:
            return []
        return result

    def build_grid(self):
        """
        Создание сетки с данными.
        @return:
        """
        res_grid = []
        count_row = 1
        for i in self.rows:
            if len(i) > 9:
                i = i[:9]
            elif len(i) < 6:
                delta = 6 - len(i)
                i.extend(delta * [' '])
            temp_list = []
            count_item = 1

            for index, x in enumerate(i):
                style = 'style="{color}{font}"'
                color = ''
                font = ''
                try:
                    temp_color = i[6]
                    if temp_color in self.colors:
                        color = 'color:' + self.colors[temp_color] + ';'
                except Exception as ex:
                    pass

                try:
                    temp_font = i[7]
                    if temp_font in self.fonts:
                        font = 'font-family:' + self.fonts[temp_font] + ';'
                except Exception as ex:
                    pass

                style = style.format(color=color, font=font)

                try:
                    white_space = '\f'
                    temp_unit = i[8]
                    if temp_unit == self.unit:
                        x = x + white_space
                except Exception as ex:
                    pass

                width = 0

                if index == 0:
                    width = '12'
                elif index == 1:
                    width = '4/12'
                else:
                    width = '72'

                temp_list.append(
                    '<pre {style} class="column w-{width}" id = "{id}">{value}</pre>'.format(width=width, style=style,
                                                                                 id=str(
                                                                                     count_row) + '_' + str(
                                                                                     count_item), value=x))


                if index == 5:
                    break
                count_item += 1
            count_row += 1
            res_grid.append(temp_list)
        return res_grid


class UserChecker:
    """
    Класс сбора данных о пользователи.
    """

    def __init__(self):
        self.system = 'phonebook'
        self.ttl = 300
        self.host = '127.0.0.1'
        self.port = 1400
        self.redis = redis.Redis(
            host=self.host,
            port=self.port,
            db=0
        )

    def set_active_user(self, user):
        """
        Запись данных активного пользователя в Redis.
        """
        try:
            self.login = user
            key = 'active:{}:{}'.format(self.system, self.login)
            record = {
                "login": self.login,
                "system": self.system,
                "url": '',
                "params": '',
                "ip": request.remote_addr,
            }
            self.redis.hmset(key, record)
            self.redis.expire(name=key, time=self.ttl)

            now = datetime.datetime.now()
            ts = datetime.datetime.timestamp(now)
            key = 'querys:{}:{}'.format(self.system, ts)
            self.redis.set(key, self.login)
            self.redis.expire(name=key, time=60)
        except Exception as ex:
            pass


@app.route('/')
@cache.cached(timeout=3600)
def index():
    """
        Основной роут справочника
    """
    # --- Kerberos Authentication

    # uc = UserChecker()
    # user = request.environ.get('REMOTE_USER')
    # uc.set_active_user(user)
    # fio = str(request.environ['AUTHORIZE_DISPLAYNAME'].encode('iso8859-1'), 'utf-8')

    # Development Authentication

    login = 'Петров А.В.'
    user = 'PetrovAV'
    grid = Grid(table, path_root, file_name, colors, fonts, unit)
    result = grid.build_grid()
    return render_template('index.html', result=result, user=user, login=login, email=user)


application = app

if __name__ == '__main__':
    from os import path, walk

    extra_dirs = ['templates', ]
    extra_files = extra_dirs[:]
    for extra_dir in extra_dirs:
        for dirname, dirs, files in walk(extra_dir):
            for filename in files:
                filename = path.join(dirname, filename)
                if path.isfile(filename):
                    extra_files.append(filename)

    app.run(debug=True, extra_files=extra_files)
