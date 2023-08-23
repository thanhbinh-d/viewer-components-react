/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { PropertyRecord } from "@itwin/appui-abstract";
import { IPropertyDataProvider, PropertyCategory, PropertyData, PropertyDataChangeEvent } from "@itwin/components-react";
import { BeEvent } from "@itwin/core-bentley";
import { HitDetail } from "@itwin/core-frontend";
import { MapHitEvent } from "../Interfaces";

/**
 * Implementation of [IPropertyDataProvider] that uses an associative array.
 * @public
 */

export enum MapFeatureInfoLoadState { DataLoadStart, DataLoadEnd }
export declare type MapFeatureInfoLoadListener = (state: MapFeatureInfoLoadState) => void;

export interface MapFeatureInfoDataUpdate {
  recordCount: number;
}
export declare type MapFeatureInfoDataUpdatedListener = (data: MapFeatureInfoDataUpdate) => void;

class SimplePropertyData implements PropertyData {
  public label: PropertyRecord = PropertyRecord.fromString("");
  public description?: string;
  public categories: PropertyCategory[] = [];
  public records: { [categoryName: string]: PropertyRecord[] } = {};
}

export class FeatureInfoDataProvider implements IPropertyDataProvider {
  private _removeListener: () => void;
  public onDataChanged = new PropertyDataChangeEvent();
  public onDataLoadStateChanged = new BeEvent<MapFeatureInfoLoadListener>();
  public onDataUpdated = new BeEvent<MapFeatureInfoDataUpdatedListener>();
  private _data = new SimplePropertyData();
  constructor(onMapHit: MapHitEvent) {
    this._removeListener = onMapHit.addListener(this._handleMapHit, this);
  }

  public onUnload() {
    this._removeListener();
  }

  private async _handleMapHit(_mapHit: HitDetail) {
    /*
    this._data = new SimplePropertyData();

    let recordCount = 0;
    if (mapHit?.isMapHit) {
      this.onDataLoadStateChanged.raiseEvent(MapFeatureInfoLoadState.DataLoadStart);
      const mapInfo = await mapHit.viewport.getMapFeatureInfo(mapHit);
      this.onDataLoadStateChanged.raiseEvent(MapFeatureInfoLoadState.DataLoadEnd);
      if (mapInfo.layerInfo !== undefined) {
        for (const curLayerInfo of mapInfo.layerInfo) {
          const layerCatIdx = this.findCategoryIndexByName(curLayerInfo.layerName);
          let nbRecords = 0;
          const layerCategory = (
            layerCatIdx === -1 ?
              { name: curLayerInfo.layerName, label: curLayerInfo.layerName, expand: true, childCategories: [] }
              : this._data.categories[layerCatIdx]);

          if (curLayerInfo.info && !(curLayerInfo.info instanceof HTMLElement)) {
            // This is not an HTMLElement, so iterate over each sub-layer info
            for (const subLayerInfo of curLayerInfo.info) {
              nbRecords++;
              const subCatIdx = layerCategory.childCategories?.findIndex((testCategory: PropertyCategory) => {
                return testCategory.name === subLayerInfo.subLayerName;
              });
              let subLayerCategory;
              if (subCatIdx === -1) {
                subLayerCategory = { name: subLayerInfo.subLayerName, label: subLayerInfo.subLayerName, expand: true };
                this.addSubCategory(subLayerCategory.name);
                layerCategory.childCategories?.push(subLayerCategory);
              }
              if (subLayerInfo.records) {
                for (const record of subLayerInfo.records) {
                  // Always use the string value for now
                  this.addProperty(record, subLayerInfo.subLayerName);

                }
              }
            }
          }
          if (layerCatIdx === -1 && nbRecords > 0)
            this.addCategory(layerCategory);

          recordCount = recordCount + nbRecords;
        }
      }
    }
    this.onDataUpdated.raiseEvent({ recordCount });
    this.onDataChanged.raiseEvent();
    */
  }

  public addSubCategory(categoryName: string) {
    this._data.records[categoryName] = [];
  }
  public addCategory(category: PropertyCategory): number {

    const categoryIdx = this._data.categories.push(category) - 1;
    this._data.records[this._data.categories[categoryIdx].name] = [];
    return categoryIdx;
  }

  public findCategoryIndex(category: PropertyCategory): number {
    const index = this._data.categories.findIndex((testCategory: PropertyCategory) => {
      return testCategory.name === category.name;
    });
    return index;
  }
  public findCategoryIndexByName(name: string): number {
    const index = this._data.categories.findIndex((testCategory: PropertyCategory) => {
      return testCategory.name === name;
    });
    return index;
  }

  public addProperty(propertyRecord: PropertyRecord, categoryName: string): void {
    const idx = this._data.records[categoryName].findIndex((prop) => prop.property.name === propertyRecord.property.name);
    if (idx === -1) {
      this._data.records[categoryName].push(propertyRecord);
    } else {
      this._data.records[categoryName][idx].isMerged = true;
      this._data.records[categoryName][idx].isReadonly = true;
    }
  }

  public removeProperty(propertyRecord: PropertyRecord, categoryIdx: number): boolean {
    const index = this._data.records[this._data.categories[categoryIdx].name].findIndex((record: PropertyRecord) => {
      return record === propertyRecord;
    });

    let result = false;

    if (index >= 0) {
      this._data.records[this._data.categories[categoryIdx].name].splice(index, 1);
      this.onDataChanged.raiseEvent();
      result = true;
    }
    return result;
  }

  public replaceProperty(propertyRecord: PropertyRecord, categoryIdx: number, newRecord: PropertyRecord): boolean {
    const index = this._data.records[this._data.categories[categoryIdx].name].findIndex((record: PropertyRecord) => {
      return record === propertyRecord;
    });

    let result = false;

    if (index >= 0) {
      this._data.records[this._data.categories[categoryIdx].name].splice(index, 1, newRecord);
      result = true;
    }
    return result;
  }

  public async getData(): Promise<PropertyData> {
    return this._data;
  }
}
