__author__ = 'yarnaid'

from collections import defaultdict
import numpy as np


def parse(df):
    res = list()
    keys = set(df.columns.values) - {'day'}
    size = len(df)

    for key in keys:
        item = {
            'label': key,
            'start': np.where(df[key] > 0)[0][0],
            'end': size - np.where(df[key][::-1] > 0)[0][0],
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
                print '!!!!!!'
            print label, prev_label

    return res