#import <Foundation/Foundation.h>
#import <PDFKit/PDFKit.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        if (argc < 3) {
            printf("Usage: %s <start_page_1_indexed> <end_page_1_indexed> [outfile]\n", argv[0]);
            return 1;
        }
        NSInteger start = atoi(argv[1]);
        NSInteger end = atoi(argv[2]);
        NSString *outPath = argc >= 4 ? [NSString stringWithUTF8String:argv[3]] : nil;

        NSString *pdfPath = @"/Users/anurag/pworkspace/astro-tools/reference_books/ahtmd_mehta.pdf";
        NSURL *url = [NSURL fileURLWithPath:pdfPath];
        PDFDocument *doc = [[PDFDocument alloc] initWithURL:url];
        if (!doc) {
            printf("Error: Could not open PDF\n");
            return 1;
        }

        NSMutableString *extracted = [NSMutableString string];
        for (NSInteger i = start; i <= end; i++) {
            if (i < 1 || i > [doc pageCount]) continue;
            PDFPage *page = [doc pageAtIndex:(i - 1)];
            NSString *content = [page string];
            [extracted appendFormat:@"\n=== PAGE %ld ===\n", (long)i];
            if (content) {
                [extracted appendString:content];
            }
        }

        if (outPath) {
            NSError *err = nil;
            [extracted writeToFile:outPath atomically:YES encoding:NSUTF8StringEncoding error:&err];
            if (err) {
                printf("Error writing to %s: %s\n", [outPath UTF8String], [[err localizedDescription] UTF8String]);
                return 1;
            }
            printf("Wrote pages %ld-%ld to %s (%lu characters)\n", (long)start, (long)end, [outPath UTF8String], (unsigned long)[extracted length]);
        } else {
            printf("%s\n", [extracted UTF8String]);
        }
    }
    return 0;
}
