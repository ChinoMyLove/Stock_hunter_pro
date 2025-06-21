import pandas as pd
import csv
import logging
from typing import List, Dict, Any, Optional
import io

logger = logging.getLogger(__name__)

class FileHandler:
    """Handle CSV and Excel file operations for stock data"""
    
    def __init__(self):
        self.supported_formats = ['.csv', '.xlsx', '.xls', '.tsv']
    
    def read_stock_list(self, file_path: str) -> List[str]:
        """
        Read stock symbols from a file
        Returns list of cleaned stock symbols
        """
        try:
            if file_path.lower().endswith('.csv'):
                return self._read_csv_file(file_path)
            elif file_path.lower().endswith(('.xlsx', '.xls')):
                return self._read_excel_file(file_path)
            elif file_path.lower().endswith('.tsv'):
                return self._read_tsv_file(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_path}")
                
        except Exception as e:
            logger.error(f"❌ Error reading file {file_path}: {e}")
            return []
    
    def _read_csv_file(self, file_path: str) -> List[str]:
        """Read symbols from CSV file"""
        symbols = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                # Try to detect if file has headers
                sample = file.read(1024)
                file.seek(0)
                
                sniffer = csv.Sniffer()
                has_header = sniffer.has_header(sample)
                
                reader = csv.reader(file)
                
                if has_header:
                    next(reader)  # Skip header row
                
                for row in reader:
                    if row and len(row) > 0:
                        symbol = row[0].strip().upper()
                        if symbol and symbol not in symbols:
                            symbols.append(symbol)
                            
        except Exception as e:
            logger.error(f"❌ Error reading CSV file: {e}")
            
        return symbols
    
    def _read_excel_file(self, file_path: str) -> List[str]:
        """Read symbols from Excel file"""
        symbols = []
        
        try:
            df = pd.read_excel(file_path)
            
            # Get the first column that contains data
            first_col = df.iloc[:, 0].dropna()
            
            for symbol in first_col:
                symbol_str = str(symbol).strip().upper()
                if symbol_str and symbol_str not in symbols:
                    symbols.append(symbol_str)
                    
        except Exception as e:
            logger.error(f"❌ Error reading Excel file: {e}")
            
        return symbols
    
    def _read_tsv_file(self, file_path: str) -> List[str]:
        """Read symbols from TSV file"""
        symbols = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                reader = csv.reader(file, delimiter='\t')
                
                for row in reader:
                    if row and len(row) > 0:
                        symbol = row[0].strip().upper()
                        if symbol and symbol not in symbols:
                            symbols.append(symbol)
                            
        except Exception as e:
            logger.error(f"❌ Error reading TSV file: {e}")
            
        return symbols
    
    def export_results_to_csv(self, results: List[Dict[str, Any]], output_path: str) -> bool:
        """Export analysis results to CSV file"""
        try:
            df_data = []
            
            for result in results:
                metrics = result.get('metrics', {})
                
                row = {
                    'Symbol': result.get('symbol', ''),
                    'Status': 'PASS' if result.get('passed', False) else 'FAIL',
                    'RS_Rating': result.get('rs_rating', 0),
                    'Price': metrics.get('price', 0),
                    'MA_50': metrics.get('ma_50', 0),
                    'MA_150': metrics.get('ma_150', 0),
                    'MA_200': metrics.get('ma_200', 0),
                    '52W_High': metrics.get('week_52_high', 0),
                    '52W_Low': metrics.get('week_52_low', 0),
                    'From_High_%': metrics.get('from_high_pct', 0),
                    'From_Low_%': metrics.get('from_low_pct', 0),
                    'MA200_Trending': 'UP' if metrics.get('ma200_trending_up', False) else 'DOWN',
                    'Volume': metrics.get('volume', 0),
                    'Volume_Ratio': metrics.get('volume_ratio', 1.0),
                    'Fail_Reasons': '; '.join(result.get('fail_reasons', []))
                }
                
                df_data.append(row)
            
            df = pd.DataFrame(df_data)
            df.to_csv(output_path, index=False)
            
            logger.info(f"✅ Results exported to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error exporting results: {e}")
            return False
    
    def validate_symbols(self, symbols: List[str]) -> List[str]:
        """Validate and clean stock symbols"""
        cleaned_symbols = []
        
        for symbol in symbols:
            # Clean the symbol
            clean_symbol = str(symbol).strip().upper()
            
            # Basic validation
            if len(clean_symbol) > 0 and len(clean_symbol) <= 10:
                # Allow alphanumeric characters, dots, and hyphens
                if clean_symbol.replace('.', '').replace('-', '').isalnum():
                    cleaned_symbols.append(clean_symbol)
                else:
                    logger.warning(f"⚠️ Invalid symbol format: {symbol}")
            else:
                logger.warning(f"⚠️ Invalid symbol length: {symbol}")
        
        return cleaned_symbols