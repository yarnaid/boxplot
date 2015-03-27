__author__ = 'yarnaid'

from collections import defaultdict
# import numpy as np


def parse(df):
    res = list()
    keys = set(df.columns.values) - {'day'}

    for key in keys:
        seria = df[key]
        non_zero = seria[seria > 0]
        index = non_zero.index
        item = {
            'label': key,
            'start': index[0],
            'end': index[-1],
            'className': 'network'
        }
        res.append(item)
    res.sort(key=lambda x: x['label'])

    for i, item in enumerate(res, -1):
        label = item['label']
        if len(label) > 1:
            prev_label = res[i]['label']
            if label[:-1].count(prev_label) > 0:
                res[i+1]['parent'] = i

    return res


def line_data(df):
    res = list()
    keys = set(df.columns.values) - {'day'}

    for key in keys:
        row = [key]
        row.extend(df[key])
        res.append(row)

    return res


def line_nvd3_data(df):
    res = list()
    keys = set(df.columns.values) - {'day'}
    size = len(df)

    for key in keys:
        res.append({
            'key': key,
            'values': [{'x': df['day'][i], 'y': df[key][i]} for i in xrange(size)]
            })
    return res