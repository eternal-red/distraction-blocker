import PySimpleGUI as sg

def popup_poc():
    event, values = sg.Window('Choose an option', [[sg.Text('Select one->'), sg.Listbox(['Option a', 'Option b', 'Option c'], size=(20, 3), key='LB')],
        [sg.Button('Ok'), sg.Button('Cancel')]]).read(close=True)

    if event == 'Ok':
        sg.popup(f'You chose {values["LB"][0]}')
    else:
        sg.popup_cancel('User aborted')